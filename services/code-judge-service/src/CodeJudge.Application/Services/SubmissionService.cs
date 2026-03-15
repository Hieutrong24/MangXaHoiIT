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

    public SubmissionService(
        ISubmissionRepository subs,
        IProblemRepository problems,
        ILanguageRepository langs,
        IJudgeQueue queue,
        IJudgeResultRepository results,
        IUnitOfWork uow)
    {
        _subs = subs;
        _problems = problems;
        _langs = langs;
        _queue = queue;
        _uow = uow;
        _results = results;
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
            Status = SubmissionStatus.Queued
        };

        await _subs.AddAsync(sub, ct);
        await _uow.SaveChangesAsync(ct);

        await _queue.EnqueueAsync(sub.SubmissionId, ct);

        return new SubmissionDto(sub.SubmissionId, sub.ProblemId, sub.UserId, sub.LanguageId, lang.Name, (byte)sub.Status, sub.SubmittedAt, null, null, null, null);
    }

    public async Task<SubmissionDto?> GetAsync(Guid submissionId, CancellationToken ct = default)
    {
        var sub = await _subs.GetAsync(submissionId, ct);
        if (sub is null) return null;

        var lang = await _langs.GetAsync(sub.LanguageId, ct);
        return new SubmissionDto(
            sub.SubmissionId, sub.ProblemId, sub.UserId, sub.LanguageId, lang?.Name ?? "unknown",
            (byte)sub.Status, sub.SubmittedAt, sub.TotalTimeMs, sub.TotalMemoryKB, sub.Score, sub.CompilerMessage
        );
    }

    public async Task<JudgeResultDto?> GetResultAsync(Guid submissionId, CancellationToken ct = default)
    {
        var sub = await _subs.GetWithDetailsAsync(submissionId, ct);
        if (sub is null) return null;

        var tests = await _results.ListBySubmissionAsync(submissionId, ct);

        var verdict = sub.Status.ToString();

        var peak = tests.Count == 0 ? 0 : tests.Max(x => x.MemoryKB);

        var items = tests.Select(t => new JudgeTestResultDto(
            t.TestCaseId,
            t.TestCase?.OrderNo ?? 0,
            t.Status,
            t.TimeMs,
            t.MemoryKB,
            t.ErrorMessage
        )).OrderBy(x => x.OrderNo).ToList();

        return new JudgeResultDto(sub.SubmissionId, verdict, sub.TotalTimeMs ?? 0, peak, sub.Score, sub.CompilerMessage, items);
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
