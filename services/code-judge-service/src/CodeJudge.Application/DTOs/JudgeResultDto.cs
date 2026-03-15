namespace CodeJudge.Application.DTOs;

public sealed record JudgeTestResultDto(
    Guid TestCaseId,
    int OrderNo,
    byte Status,
    int TimeMs,
    int MemoryKB,
    string? ErrorMessage
);

public sealed record JudgeResultDto(
    Guid SubmissionId,
    string Verdict,
    int TotalTimeMs,
    int PeakMemoryKB,
    int? Score,
    string? CompileLog,
    IReadOnlyList<JudgeTestResultDto> Tests
);
