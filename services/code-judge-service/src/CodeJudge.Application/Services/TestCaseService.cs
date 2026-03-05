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

    public async Task<List<TestCaseDto>> ListByProblemAsync(Guid problemId, CancellationToken ct = default)
    {
        var list = await _testCases.ListByProblemAsync(problemId, ct);
        return list.OrderBy(x => x.OrderNo).Select(tc =>
            new TestCaseDto(tc.TestCaseId, tc.ProblemId, tc.OrderNo, tc.IsSample, tc.Score, Helpers.FromBytesUtf8(tc.InputData), Helpers.FromBytesUtf8(tc.OutputData))
        ).ToList();
    }
}
