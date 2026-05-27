namespace CodeJudge.Application.DTOs;

public sealed record ProblemSearchRequest(
    string? Keyword,
    byte? Difficulty,
    string? GroupName,
    string? TypeName,
    int? MinScore,
    int? MaxScore,
    string? UserStatus,
    int Page = 1,
    int PageSize = 20,
    string? SortBy = null,
    string? SortDir = null,
    bool FeaturedOnly = false,
    string? Topic = null,
    string? SkillTag = null
);

public sealed record OJProblemListItemDto(
    Guid ProblemId,
    string ProblemCode,
    string Title,
    string GroupName,
    string TypeName,
    int MaxScore,
    double AcceptanceRate,
    int AcceptedCount,
    int TotalSubmissions,
    int AttemptedCount,
    int SampleCount,
    int TestCaseCount,
    string UserStatus,
    bool IsSolved,
    bool HasTried,
    string? Topic = null,
    string? SkillTag = null,
    int? EstimatedMinutes = null,
    int? PointsReward = null,
    string? ProblemType = null
);

public sealed record OJProblemListResponseDto(
    IReadOnlyList<OJProblemListItemDto> Items,
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages,
    IReadOnlyList<string> AvailableGroups,
    IReadOnlyList<string> AvailableTypes,
    IReadOnlyList<string>? AvailableTopics = null,
    IReadOnlyList<string>? AvailableSkillTags = null
);

public sealed record FeaturedProblemDto(
    Guid ProblemId,
    string ProblemCode,
    string Title,
    string GroupName,
    int MaxScore,
    double AcceptanceRate,
    int AcceptedCount,
    int TotalSubmissions,
    string? Topic = null,
    int? PointsReward = null
);

public sealed record ProblemOverviewDto(
    Guid ProblemId,
    string ProblemCode,
    string Title,
    string Slug,
    string Statement,
    byte Difficulty,
    string GroupName,
    string TypeName,
    int TimeLimitMs,
    int MemoryLimitMB,
    int MaxScore,
    int SampleCount,
    int TestCaseCount,
    int TotalSubmissions,
    int AcceptedSubmissions,
    int PartialSubmissions,
    int FailedSubmissions,
    double AcceptanceRate,
    double PartialRate,
    double FailedRate,
    string UserStatus,
    string? Topic = null,
    string? SkillTag = null,
    int? EstimatedMinutes = null,
    int? PointsReward = null,
    string? ProblemType = null,
    string? InputFormat = null,
    string? OutputFormat = null,
    string? ConstraintsText = null,
    string? HintText = null,
    string? StarterCode = null,
    string? EditorialText = null,
    bool? AllowCustomInput = null,
    bool? AllowPartialScoring = null,
    bool? IsFeatured = null
);
