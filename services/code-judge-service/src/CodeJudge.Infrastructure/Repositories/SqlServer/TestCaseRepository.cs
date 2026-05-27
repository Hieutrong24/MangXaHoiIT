using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class TestCaseRepository : ITestCaseRepository
{
    private readonly JudgeDbContext _db;
    public TestCaseRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(TestCase testCase, CancellationToken ct = default) => _db.TestCases.AddAsync(testCase, ct).AsTask();

    public Task<TestCase?> GetAsync(Guid testCaseId, CancellationToken ct = default)
        => _db.TestCases.FirstOrDefaultAsync(x => x.TestCaseId == testCaseId, ct);

    public Task<List<TestCase>> ListByProblemAsync(Guid problemId, CancellationToken ct = default)
        => _db.TestCases.AsNoTracking().Where(x => x.ProblemId == problemId).OrderBy(x => x.OrderNo).ToListAsync(ct);

    public void Remove(TestCase testCase) => _db.TestCases.Remove(testCase);
}
