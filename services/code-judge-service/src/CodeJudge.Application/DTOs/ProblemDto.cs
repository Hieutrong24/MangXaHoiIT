namespace CodeJudge.Application.DTOs;

public sealed record ProblemDto(
    Guid ProblemId,
    string Title,
    string Slug,
    string Statement,
    byte Difficulty,
    int TimeLimitMs,
    int MemoryLimitMB,
    bool IsPublic,
    byte Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
