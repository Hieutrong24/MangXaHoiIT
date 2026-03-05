using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class JudgeResultRepository : IJudgeResultRepository
{
    private readonly JudgeDbContext _db;
    public JudgeResultRepository(JudgeDbContext db) => _db = db;

    public async Task DeleteBySubmissionAsync(Guid submissionId, CancellationToken ct = default)
    {
        var rows = await _db.SubmissionTestResults.Where(x => x.SubmissionId == submissionId).ToListAsync(ct);
        if (rows.Count > 0) _db.SubmissionTestResults.RemoveRange(rows);
    }

    public Task AddRangeAsync(IEnumerable<JudgeResult> results, CancellationToken ct = default)
        => _db.SubmissionTestResults.AddRangeAsync(results, ct);

    public Task<List<JudgeResult>> ListBySubmissionAsync(Guid submissionId, CancellationToken ct = default)
        => _db.SubmissionTestResults.AsNoTracking()
            .Include(x => x.TestCase)
            .Where(x => x.SubmissionId == submissionId)
            .ToListAsync(ct);
}
