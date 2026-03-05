using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface ITestCaseService
{
    Task<TestCaseDto> CreateAsync(CreateTestCaseRequest req, CancellationToken ct = default);
    Task<List<TestCaseDto>> ListByProblemAsync(Guid problemId, CancellationToken ct = default);
}

public sealed record CreateTestCaseRequest(
    Guid ProblemId,
    int OrderNo,
    bool IsSample,
    int Score,
    string InputText,
    string OutputText
);
