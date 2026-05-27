using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface ITestCaseService
{
    Task<TestCaseDto> CreateAsync(CreateTestCaseRequest req, CancellationToken ct = default);
    Task<TestCaseDto?> UpdateAsync(Guid testCaseId, UpdateTestCaseRequest req, CancellationToken ct = default);
    Task<bool> DeleteAsync(Guid testCaseId, CancellationToken ct = default);
    Task<List<TestCaseDto>> ListByProblemAsync(Guid problemId, CancellationToken ct = default);
}

public sealed record CreateTestCaseRequest(
    Guid ProblemId,
    int OrderNo,
    bool IsSample,
    decimal Score,
    string InputText,
    string OutputText
);

public sealed record UpdateTestCaseRequest(
    int? OrderNo,
    bool? IsSample,
    decimal? Score,
    string? InputText,
    string? OutputText
);
