namespace CodeJudge.Application.DTOs;

public sealed record SubmissionDto(
    Guid SubmissionId,
    Guid ProblemId,
    Guid UserId,

    int LanguageId,
    string? LanguageName,        

    byte Status,
    DateTime SubmittedAt,

    int? TotalTimeMs,
    int? TotalMemoryKB,
    int? Score,
    string? CompilerMessage
);
