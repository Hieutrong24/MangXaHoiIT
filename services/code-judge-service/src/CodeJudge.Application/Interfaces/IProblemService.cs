using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface IProblemService
{
    Task<ProblemDto> CreateAsync(CreateProblemRequest req, CancellationToken ct = default);
    Task<ProblemDto?> UpdateAsync(Guid id, UpdateProblemRequest req, CancellationToken ct = default);
    Task<ProblemDto?> DeleteAsync(Guid id, CancellationToken ct = default);
    Task<List<ProblemDto>> ListAsync(CancellationToken ct = default);
    Task<ProblemDto?> GetAsync(Guid id, CancellationToken ct = default);
    Task<OJProblemListResponseDto> ListOjAsync(ProblemSearchRequest req, Guid? currentUserId, CancellationToken ct = default);
    Task<List<FeaturedProblemDto>> ListFeaturedAsync(int limit, Guid? currentUserId, CancellationToken ct = default);
    Task<ProblemOverviewDto?> GetOverviewAsync(Guid id, Guid? currentUserId, CancellationToken ct = default);
}

public sealed record CreateProblemRequest(
    string Title,
    string Slug,
    byte Difficulty,
    int TimeLimitMs,
    int MemoryLimitMB,
    string Statement,
    Guid CreatedByUserId,
    bool IsPublic,
    byte Status = 1,
    string? ProblemType = null,
    string? Topic = null,
    string? SkillTag = null,
    string? InputFormat = null,
    string? OutputFormat = null,
    string? ConstraintsText = null,
    string? HintText = null,
    string? EditorialText = null,
    bool? IsFeatured = null
);

public sealed record UpdateProblemRequest(
    string? Title,
    string? Slug,
    byte? Difficulty,
    int? TimeLimitMs,
    int? MemoryLimitMB,
    string? Statement,
    bool? IsPublic,
    byte? Status,
    string? ProblemType = null,
    string? Topic = null,
    string? SkillTag = null,
    string? InputFormat = null,
    string? OutputFormat = null,
    string? ConstraintsText = null,
    string? HintText = null,
    string? EditorialText = null,
    bool? IsFeatured = null
);
