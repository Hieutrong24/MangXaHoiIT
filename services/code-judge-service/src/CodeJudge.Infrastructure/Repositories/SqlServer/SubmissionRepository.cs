using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class SubmissionRepository : ISubmissionRepository
{
    private readonly JudgeDbContext _db;
    public SubmissionRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(Submission submission, CancellationToken ct = default) => _db.Submissions.AddAsync(submission, ct).AsTask();

    private IQueryable<Submission> ProjectSubmissionRow(IQueryable<Submission> query)
        => query.Select(x => new Submission
        {
            SubmissionId = x.SubmissionId,
            ProblemId = x.ProblemId,
            UserId = x.UserId,
            LanguageId = x.LanguageId,
            SourceCode = x.SourceCode,
            CodeHash = x.CodeHash,
            SubmittedAt = x.SubmittedAt,
            Status = x.Status,
            TotalTimeMs = x.TotalTimeMs,
            TotalMemoryKB = x.TotalMemoryKB,
            Score = x.Score,
            CompilerMessage = x.CompilerMessage,
            AttemptNo = x.AttemptNo,
            SubmissionType = x.SubmissionType ?? "normal",
            IsPractice = x.IsPractice,
            MaxScore = x.MaxScore,
            PassedTestCount = x.PassedTestCount,
            FailedTestCount = x.FailedTestCount,
            TotalTestCount = x.TotalTestCount,
            PassRate = x.PassRate,
            EarnedXp = x.EarnedXp
        });

    public Task<List<Submission>> ListAsync(Guid? problemId = null, Guid? userId = null, SubmissionStatus? status = null, int limit = 100, CancellationToken ct = default)
    {
        var query = _db.Submissions.AsNoTracking().AsQueryable();
        if (problemId.HasValue) query = query.Where(x => x.ProblemId == problemId.Value);
        if (userId.HasValue) query = query.Where(x => x.UserId == userId.Value);
        if (status.HasValue) query = query.Where(x => x.Status == status.Value);
        return ProjectSubmissionRow(query)
            .OrderByDescending(x => x.SubmittedAt)
            .Take(Math.Clamp(limit, 1, 500))
            .ToListAsync(ct);
    }

    public Task<Submission?> GetAsync(Guid submissionId, CancellationToken ct = default)
        => ProjectSubmissionRow(_db.Submissions.AsNoTracking().Where(x => x.SubmissionId == submissionId)).FirstOrDefaultAsync(ct);

    public async Task<Submission?> GetWithDetailsAsync(Guid submissionId, CancellationToken ct = default)
    {
        var submission = await ProjectSubmissionRow(_db.Submissions.AsNoTracking().Where(x => x.SubmissionId == submissionId))
            .FirstOrDefaultAsync(ct);

        if (submission is null)
            return null;

        submission.Language = await _db.Languages
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.LanguageId == submission.LanguageId, ct);

        submission.Problem = await _db.Problems
            .AsNoTracking()
            .Include(x => x.TestCases)
            .FirstOrDefaultAsync(x => x.ProblemId == submission.ProblemId, ct);

        submission.TestResults = await _db.SubmissionTestResults
            .AsNoTracking()
            .Include(x => x.TestCase)
            .Where(x => x.SubmissionId == submissionId)
            .ToListAsync(ct);

        return submission;
    }

    public async Task UpdateStatusAsync(Guid submissionId, SubmissionStatus status, string? compilerMessage, int? totalTimeMs, int? totalMemoryKb, decimal? score, CancellationToken ct = default)
    {
        var sub = await _db.Submissions.FirstOrDefaultAsync(x => x.SubmissionId == submissionId, ct);
        if (sub is null) return;

        sub.Status = status;
        sub.CompilerMessage = compilerMessage;
        sub.TotalTimeMs = totalTimeMs ?? sub.TotalTimeMs ?? 0;
        sub.TotalMemoryKB = totalMemoryKb ?? sub.TotalMemoryKB ?? 0;
        sub.Score = score ?? sub.Score ?? 0m;

        if (sub.TotalTestCount.GetValueOrDefault() > 0 && sub.PassedTestCount.HasValue)
        {
            sub.FailedTestCount = Math.Max(0, sub.TotalTestCount.Value - sub.PassedTestCount.Value);
            sub.PassRate = Math.Round((decimal)sub.PassedTestCount.Value * 100m / sub.TotalTestCount.Value, 2);
        }

        if (!sub.MaxScore.HasValue || sub.MaxScore <= 0)
        {
            sub.MaxScore = Math.Max(score ?? 0m, 100m);
        }

        if (status == SubmissionStatus.AC)
        {
            sub.EarnedXp ??= (int)Math.Round((score ?? 0m) <= 0 ? 10m : (score ?? 0m) / 10m);
        }
    }
}
