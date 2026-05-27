using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;

namespace CodeJudge.Application.Services;

public sealed class SubmissionService : ISubmissionService
{
    private readonly ISubmissionRepository _subs;
    private readonly IProblemRepository _problems;
    private readonly ILanguageRepository _langs;
    private readonly IJudgeQueue _queue;
    private readonly IUnitOfWork _uow;
    private readonly IJudgeResultRepository _results;

    public SubmissionService(ISubmissionRepository subs, IProblemRepository problems, ILanguageRepository langs, IJudgeQueue queue, IJudgeResultRepository results, IUnitOfWork uow)
    {
        _subs = subs; _problems = problems; _langs = langs; _queue = queue; _results = results; _uow = uow;
    }

    public async Task<SubmissionDto> CreateAsync(CreateSubmissionRequest req, CancellationToken ct = default)
    {
        var p = await _problems.GetAsync(req.ProblemId, ct);
        if (p is null) throw new InvalidOperationException("Problem not found.");
        var lang = await _langs.GetAsync(req.LanguageId, ct);
        if (lang is null || !lang.IsEnabled) throw new InvalidOperationException("Language not supported.");

        var sub = new Submission
        {
            SubmissionId = Guid.NewGuid(),
            ProblemId = req.ProblemId,
            UserId = req.UserId,
            LanguageId = req.LanguageId,
            SourceCode = req.SourceCode,
            CodeHash = Helpers.Sha256(req.SourceCode),
            SubmittedAt = DateTime.UtcNow,
            Status = SubmissionStatus.Queued,
            Score = 0m,
            TotalTimeMs = 0,
            TotalMemoryKB = 0,
            MaxScore = p.MaxScore,
            SubmissionType = "normal",
            IsPractice = true,
        };

        await _subs.AddAsync(sub, ct);
        await _uow.SaveChangesAsync(ct);
        await _queue.EnqueueAsync(sub.SubmissionId, ct);
        return new SubmissionDto(sub.SubmissionId, sub.ProblemId, sub.UserId, sub.LanguageId, lang.Name, (byte)sub.Status, sub.SubmittedAt, sub.TotalTimeMs, sub.TotalMemoryKB, sub.Score, sub.CompilerMessage);
    }

    public async Task<List<SubmissionDto>> ListAsync(Guid? problemId = null, Guid? userId = null, byte? status = null, int limit = 100, CancellationToken ct = default)
    {
        SubmissionStatus? parsedStatus = null;
        if (status.HasValue && Enum.IsDefined(typeof(SubmissionStatus), status.Value)) parsedStatus = (SubmissionStatus)status.Value;
        var items = await _subs.ListAsync(problemId, userId, parsedStatus, limit, ct);
        var result = new List<SubmissionDto>();
        foreach (var sub in items)
        {
            var lang = await _langs.GetAsync(sub.LanguageId, ct);
            result.Add(new SubmissionDto(sub.SubmissionId, sub.ProblemId, sub.UserId, sub.LanguageId, lang?.Name ?? "unknown", (byte)sub.Status, sub.SubmittedAt, sub.TotalTimeMs, sub.TotalMemoryKB, sub.Score, sub.CompilerMessage));
        }
        return result;
    }

    public async Task<SubmissionDto?> GetAsync(Guid submissionId, CancellationToken ct = default)
    {
        var sub = await _subs.GetAsync(submissionId, ct);
        if (sub is null) return null;
        var lang = await _langs.GetAsync(sub.LanguageId, ct);
        return new SubmissionDto(sub.SubmissionId, sub.ProblemId, sub.UserId, sub.LanguageId, lang?.Name ?? "unknown", (byte)sub.Status, sub.SubmittedAt, sub.TotalTimeMs, sub.TotalMemoryKB, sub.Score, sub.CompilerMessage);
    }

    public async Task<JudgeResultDto?> GetResultAsync(Guid submissionId, CancellationToken ct = default)
    {
        var sub = await _subs.GetWithDetailsAsync(submissionId, ct);
        if (sub is null) return null;

        var tests = await _results.ListBySubmissionAsync(submissionId, ct);
        var allTestCases = sub.Problem?.TestCases?.OrderBy(x => x.OrderNo).ToList() ?? new List<TestCase>();
        decimal maxScore = allTestCases.Sum(x => Math.Max(0m, x.Score));
        if (maxScore <= 0) maxScore = Math.Max(100m, allTestCases.Count == 0 ? 100m : allTestCases.Count * 10m);

        var verdict = sub.Status.ToString();
        var peak = tests.Count == 0 ? 0 : tests.Max(x => x.MemoryKB);
        var items = tests.Select(t => {
            var tc = t.TestCase;
            return new JudgeTestResultDto(t.TestCaseId, tc?.OrderNo ?? 0, t.Status, t.TimeMs, t.MemoryKB, t.ErrorMessage, tc?.Score ?? 0m, tc?.IsSample ?? false, tc?.InputText ?? (tc is null ? null : Helpers.FromBytesUtf8(tc.InputData ?? Array.Empty<byte>())), tc?.ExpectedOutputText ?? (tc is null ? null : Helpers.FromBytesUtf8(tc.OutputData ?? Array.Empty<byte>())), t.ActualOutput, t.CheckerNote);
        }).OrderBy(x => x.OrderNo).ToList();

        var passedTests = items.Count(x => x.Status == 1);
        var failedTests = items.Count(x => x.Status != 1);
        var earnedScore = Math.Max(0m, sub.Score ?? 0m);
        var partialTests = earnedScore > 0 && passedTests < Math.Max(items.Count, 1) ? items.Count - passedTests : 0;
        var passedRate = items.Count == 0 ? 0 : Math.Round((double)passedTests * 100d / items.Count, 1);
        var failedRate = items.Count == 0 ? 0 : Math.Round((double)failedTests * 100d / items.Count, 1);
        var scoreRate = maxScore <= 0 ? 0 : Math.Round((double)(earnedScore * 100m / maxScore), 1);
        var partialRate = verdict == SubmissionStatus.AC.ToString() ? 0 : scoreRate;
        var analytics = new JudgeAnalyticsDto(items.Count, passedTests, failedTests, partialTests, earnedScore, maxScore, passedRate, failedRate, partialRate, scoreRate, earnedScore > 0 && !string.Equals(verdict, SubmissionStatus.AC.ToString(), StringComparison.OrdinalIgnoreCase));
        return new JudgeResultDto(sub.SubmissionId, verdict, sub.TotalTimeMs ?? 0, peak, sub.Score, sub.CompilerMessage, items, analytics);
    }

    public async Task RejudgeAsync(Guid submissionId, CancellationToken ct = default)
    {
        await _results.DeleteBySubmissionAsync(submissionId, ct);
        await _subs.UpdateStatusAsync(submissionId, SubmissionStatus.Queued, null, null, null, null, ct);
        await _uow.SaveChangesAsync(ct);
        await _queue.EnqueueAsync(submissionId, ct);
    }

    public async Task CancelAsync(Guid submissionId, CancellationToken ct = default)
    {
        await _subs.UpdateStatusAsync(submissionId, SubmissionStatus.RE, "Cancelled", null, null, null, ct);
        await _uow.SaveChangesAsync(ct);
    }
}
