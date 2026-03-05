using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class ProblemRepository : IProblemRepository
{
    private readonly JudgeDbContext _db;
    public ProblemRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(Problem problem, CancellationToken ct = default) => _db.Problems.AddAsync(problem, ct).AsTask();

    public Task<Problem?> GetAsync(Guid problemId, CancellationToken ct = default)
        => _db.Problems.AsNoTracking().FirstOrDefaultAsync(x => x.ProblemId == problemId, ct);

    public Task<List<Problem>> ListAsync(CancellationToken ct = default)
        => _db.Problems.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync(ct);

    public void Update(Problem problem) => _db.Problems.Update(problem);
}
