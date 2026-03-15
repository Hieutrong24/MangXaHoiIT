using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface ITestCaseRepository
{
    Task<List<TestCase>> ListByProblemAsync(Guid problemId, CancellationToken ct = default);
    Task AddAsync(TestCase testCase, CancellationToken ct = default);
    Task<TestCase?> GetAsync(Guid testCaseId, CancellationToken ct = default);
    void Remove(TestCase testCase);
}
