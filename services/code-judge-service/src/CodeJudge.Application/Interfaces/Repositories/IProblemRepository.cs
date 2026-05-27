using CodeJudge.Application.DTOs;
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface IProblemRepository
{
    Task<Problem?> GetAsync(Guid problemId, CancellationToken ct = default);
    Task<List<Problem>> ListAsync(CancellationToken ct = default);
    Task AddAsync(Problem problem, CancellationToken ct = default);
    void Update(Problem problem);
    void Remove(Problem problem);
    Task<OJProblemListResponseDto> ListOjAsync(ProblemSearchRequest query, Guid? currentUserId, CancellationToken ct = default);
    Task<List<FeaturedProblemDto>> ListFeaturedAsync(int limit, Guid? currentUserId, CancellationToken ct = default);
    Task<ProblemOverviewDto?> GetOverviewAsync(Guid problemId, Guid? currentUserId, CancellationToken ct = default);
}
