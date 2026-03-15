using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface IProblemService
{
    Task<ProblemDto> CreateAsync(CreateProblemRequest req, CancellationToken ct = default);
    Task<List<ProblemDto>> ListAsync(CancellationToken ct = default);
    Task<ProblemDto?> GetAsync(Guid id, CancellationToken ct = default);
}

public sealed record CreateProblemRequest(
    string Title,
    string Slug,
    byte Difficulty,
    int TimeLimitMs,
    int MemoryLimitMB,
    string Statement,
    Guid CreatedByUserId,
    bool IsPublic
);
