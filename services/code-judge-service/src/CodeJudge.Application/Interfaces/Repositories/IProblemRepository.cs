using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface IProblemRepository
{
    Task<Problem?> GetAsync(Guid problemId, CancellationToken ct = default);
    Task<List<Problem>> ListAsync(CancellationToken ct = default);
    Task AddAsync(Problem problem, CancellationToken ct = default);
    void Update(Problem problem);
}
