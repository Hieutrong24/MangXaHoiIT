using CodeJudge.Application.Interfaces;
using CodeJudge.Infrastructure.Persistence.SqlServer;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly JudgeDbContext _db;
    public UnitOfWork(JudgeDbContext db) => _db = db;
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
