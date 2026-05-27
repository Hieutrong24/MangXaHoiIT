namespace CodeJudge.Application.DTOs;

public sealed record TestCaseDto(
    Guid TestCaseId,
    Guid ProblemId,
    int OrderNo,
    bool IsSample,
    decimal Score,
    string InputText,
    string OutputText
);
