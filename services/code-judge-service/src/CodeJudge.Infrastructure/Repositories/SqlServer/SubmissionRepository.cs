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

    public Task<Submission?> GetAsync(Guid submissionId, CancellationToken ct = default)
        => _db.Submissions.AsNoTracking().FirstOrDefaultAsync(x => x.SubmissionId == submissionId, ct);

    public Task<Submission?> GetWithDetailsAsync(Guid submissionId, CancellationToken ct = default)
        => _db.Submissions.AsNoTracking()
            .Include(x => x.Language)
            .Include(x => x.TestResults).ThenInclude(r => r.TestCase)
            .FirstOrDefaultAsync(x => x.SubmissionId == submissionId, ct);

    public async Task UpdateStatusAsync(Guid submissionId, SubmissionStatus status, string? compilerMessage, int? totalTimeMs, int? totalMemoryKb, int? score, CancellationToken ct = default)
    {
        var sub = await _db.Submissions.FirstOrDefaultAsync(x => x.SubmissionId == submissionId, ct);
        if (sub is null) return;

        sub.Status = status;
        sub.CompilerMessage = compilerMessage;
        sub.TotalTimeMs = totalTimeMs;
        sub.TotalMemoryKB = totalMemoryKb;
        sub.Score = score;
    }
}
