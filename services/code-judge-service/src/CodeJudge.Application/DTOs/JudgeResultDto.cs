namespace CodeJudge.Application.DTOs;

public sealed record JudgeTestResultDto(
    Guid TestCaseId,
    int OrderNo,
    byte Status,
    int TimeMs,
    int MemoryKB,
    string? ErrorMessage,
    decimal Score,
    bool IsSample,
    string? InputPreview,
    string? ExpectedOutputPreview,
    string? ActualOutput = null,
    string? CheckerNote = null
);

public sealed record JudgeAnalyticsDto(
    int TotalTests,
    int PassedTests,
    int FailedTests,
    int PartialTests,
    decimal EarnedScore,
    decimal MaxScore,
    double PassedRate,
    double FailedRate,
    double PartialRate,
    double ScoreRate,
    bool IsPartiallyCorrect
);

public sealed record JudgeResultDto(
    Guid SubmissionId,
    string Verdict,
    int TotalTimeMs,
    int PeakMemoryKB,
    decimal? Score,
    string? CompileLog,
    IReadOnlyList<JudgeTestResultDto> Tests,
    JudgeAnalyticsDto? Analytics
);
