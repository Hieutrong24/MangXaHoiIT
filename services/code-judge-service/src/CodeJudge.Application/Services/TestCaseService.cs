using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Services;

public sealed class TestCaseService : ITestCaseService
{
    private readonly IProblemRepository _problems;
    private readonly ITestCaseRepository _testCases;
    private readonly IUnitOfWork _uow;

    public TestCaseService(IProblemRepository problems, ITestCaseRepository testCases, IUnitOfWork uow)
    {
        _problems = problems;
        _testCases = testCases;
        _uow = uow;
    }

    public async Task<TestCaseDto> CreateAsync(CreateTestCaseRequest req, CancellationToken ct = default)
    {
        var p = await _problems.GetAsync(req.ProblemId, ct);
        if (p is null) throw new InvalidOperationException("Problem not found.");

        var tc = new TestCase
        {
            TestCaseId = Guid.NewGuid(),
            ProblemId = req.ProblemId,
            OrderNo = req.OrderNo,
            IsSample = req.IsSample,
            Score = req.Score,
            InputData = Helpers.ToBytesUtf8(req.InputText),
            OutputData = Helpers.ToBytesUtf8(req.OutputText)
        };

        await _testCases.AddAsync(tc, ct);
        await _uow.SaveChangesAsync(ct);

        return new TestCaseDto(tc.TestCaseId, tc.ProblemId, tc.OrderNo, tc.IsSample, tc.Score, req.InputText, req.OutputText);
    }

    public async Task<TestCaseDto?> UpdateAsync(Guid testCaseId, UpdateTestCaseRequest req, CancellationToken ct = default)
    {
        var tc = await _testCases.GetAsync(testCaseId, ct);
        if (tc is null) return null;
        if (req.OrderNo.HasValue) tc.OrderNo = req.OrderNo.Value;
        if (req.IsSample.HasValue) tc.IsSample = req.IsSample.Value;
        if (req.Score.HasValue) tc.Score = req.Score.Value;
        if (req.InputText is not null) tc.InputData = Helpers.ToBytesUtf8(req.InputText);
        if (req.OutputText is not null) tc.OutputData = Helpers.ToBytesUtf8(req.OutputText);
        tc.UpdatedAt = DateTime.UtcNow;
        await _uow.SaveChangesAsync(ct);
        return new TestCaseDto(tc.TestCaseId, tc.ProblemId, tc.OrderNo, tc.IsSample, tc.Score, Helpers.FromBytesUtf8(tc.InputData ?? Array.Empty<byte>()), Helpers.FromBytesUtf8(tc.OutputData ?? Array.Empty<byte>()));
    }

    public async Task<bool> DeleteAsync(Guid testCaseId, CancellationToken ct = default)
    {
        var tc = await _testCases.GetAsync(testCaseId, ct);
        if (tc is null) return false;
        _testCases.Remove(tc);
        await _uow.SaveChangesAsync(ct);
        return true;
    }

    public async Task<List<TestCaseDto>> ListByProblemAsync(Guid problemId, CancellationToken ct = default)
    {
        var list = await _testCases.ListByProblemAsync(problemId, ct);
        return list.OrderBy(x => x.OrderNo).Select(tc =>
            new TestCaseDto(tc.TestCaseId, tc.ProblemId, tc.OrderNo, tc.IsSample, tc.Score, Helpers.FromBytesUtf8(tc.InputData ?? Array.Empty<byte>()), Helpers.FromBytesUtf8(tc.OutputData ?? Array.Empty<byte>()))
        ).ToList();
    }
}
