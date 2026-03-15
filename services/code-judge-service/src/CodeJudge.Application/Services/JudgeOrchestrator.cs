using System.Text.Json;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;

namespace CodeJudge.Application.Services;

public sealed class JudgeOrchestrator
{
    private readonly ISubmissionRepository _subs;
    private readonly IProblemRepository _problems;
    private readonly ITestCaseRepository _testCases;
    private readonly ILanguageRepository _langs;
    private readonly IJudgeResultRepository _results;
    private readonly IExecutionLogRepository _logs;
    private readonly IUnitOfWork _uow;
    private readonly ICodeRunnerClient _runner;
    private readonly IOutboxRepository _outbox;
    private readonly IUserProblemStatRepository _stats;

    public JudgeOrchestrator(
        ISubmissionRepository subs,
        IProblemRepository problems,
        ITestCaseRepository testCases,
        ILanguageRepository langs,
        IJudgeResultRepository results,
        IExecutionLogRepository logs,
        IUserProblemStatRepository stats,
        IOutboxRepository outbox,
        ICodeRunnerClient runner,
        IUnitOfWork uow)
    {
        _subs = subs;
        _problems = problems;
        _testCases = testCases;
        _langs = langs;
        _results = results;
        _logs = logs;
        _stats = stats;
        _outbox = outbox;
        _runner = runner;
        _uow = uow;
    }

    public async Task JudgeAsync(Guid submissionId, CancellationToken ct = default)
    {
        var sub = await _subs.GetAsync(submissionId, ct);
        if (sub is null) return;
        if (sub.Status != SubmissionStatus.Queued) return;

        await _subs.UpdateStatusAsync(submissionId, SubmissionStatus.Running, null, null, null, null, ct);
        await _uow.SaveChangesAsync(ct);

        try
        {
            var problem = await _problems.GetAsync(sub.ProblemId, ct) ?? throw new InvalidOperationException("Problem not found");
            var lang = await _langs.GetAsync(sub.LanguageId, ct) ?? throw new InvalidOperationException("Language not found");
            if (!lang.IsEnabled) throw new InvalidOperationException("Language disabled");

            var tcs = await _testCases.ListByProblemAsync(sub.ProblemId, ct);
            if (tcs.Count == 0) throw new InvalidOperationException("No testcases configured");

            var runnerReq = new RunnerRunRequest(
                LanguageName: lang.Name,
                SourceCode: sub.SourceCode,
                TimeLimitMs: problem.TimeLimitMs,
                MemoryLimitMb: problem.MemoryLimitMB,
                Tests: tcs.OrderBy(x => x.OrderNo).Select((x, i) =>
                    new RunnerTestCase(i + 1, Helpers.FromBytesUtf8(x.InputData), Helpers.FromBytesUtf8(x.OutputData))
                ).ToList()
            );

            var runnerResp = await _runner.RunAsync(runnerReq, ct);

        
            if (!string.IsNullOrWhiteSpace(runnerResp.CompileLog))
                await _logs.AppendAsync(submissionId, "compile", runnerResp.CompileLog!, ct);


            await _results.DeleteBySubmissionAsync(submissionId, ct);

            var tcByIndex = tcs.OrderBy(x => x.OrderNo).Select((x, i) => new { idx = i + 1, tc = x }).ToDictionary(x => x.idx, x => x.tc);

            var rows = new List<JudgeResult>();
            foreach (var tr in runnerResp.Tests)
            {
                if (!tcByIndex.TryGetValue(tr.Index, out var tcRow)) continue;
                rows.Add(new JudgeResult
                {
                    SubmissionId = submissionId,
                    TestCaseId = tcRow.TestCaseId,
                    Status = VerdictCalculator.ToTestResultStatus(tr.Verdict),
                    TimeMs = tr.TimeMs,
                    MemoryKB = tr.MemoryKb,
                    ErrorMessage = tr.Stderr
                });

                if (!string.IsNullOrWhiteSpace(tr.Stderr))
                    await _logs.AppendAsync(submissionId, $"stderr:test{tr.Index}", tr.Stderr!, ct);
            }

            await _results.AddRangeAsync(rows, ct);

            var allZero = tcs.All(x => x.Score == 0);
            int score = 0;
            foreach (var r in rows)
            {
                if (r.Status == 1) // pass
                {
                    var tc = tcs.First(x => x.TestCaseId == r.TestCaseId);
                    score += allZero ? 1 : Math.Max(0, tc.Score);
                }
            }

            var finalStatus = VerdictCalculator.ToSubmissionStatus(runnerResp.Verdict);
            await _subs.UpdateStatusAsync(
                submissionId,
                finalStatus,
                runnerResp.CompileLog,
                runnerResp.TotalTimeMs,
                runnerResp.PeakMemoryKb,
                score,
                ct
            );

            await _stats.UpsertAsync(sub.UserId, sub.ProblemId, (byte)finalStatus, runnerResp.TotalTimeMs, runnerResp.PeakMemoryKb, score, sub.SubmittedAt, ct);
            await _outbox.AddAsync(new OutboxCreate(
                AggregateId: submissionId,
                EventType: "Judge.SubmissionJudged",
                PayloadJson: JsonSerializer.Serialize(new
                {
                    submissionId,
                    verdict = finalStatus.ToString(),
                    totalTimeMs = runnerResp.TotalTimeMs,
                    totalMemoryKb = runnerResp.PeakMemoryKb,
                    score
                })
            ), ct);

            await _uow.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            await _logs.AppendAsync(submissionId, "system", ex.ToString(), ct);
            await _subs.UpdateStatusAsync(submissionId, SubmissionStatus.RE, ex.Message, null, null, null, ct);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
