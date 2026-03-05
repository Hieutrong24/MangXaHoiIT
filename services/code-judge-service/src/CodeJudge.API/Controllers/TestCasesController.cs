using CodeJudge.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/testcases")]
public sealed class TestCasesController : ControllerBase
{
    private readonly ITestCaseService _svc;
    public TestCasesController(ITestCaseService svc) => _svc = svc;

    [HttpGet("by-problem/{problemId:guid}")]
    public Task<List<CodeJudge.Application.DTOs.TestCaseDto>> ListByProblem(Guid problemId, CancellationToken ct)
        => _svc.ListByProblemAsync(problemId, ct);

    public sealed record CreateTestCaseReq(Guid ProblemId, int OrderNo, bool IsSample, int Score, string InputText, string OutputText);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTestCaseReq req, CancellationToken ct)
    {
        var dto = await _svc.CreateAsync(
            new CreateTestCaseRequest(req.ProblemId, req.OrderNo, req.IsSample, req.Score, req.InputText, req.OutputText),
            ct
        );
        return Ok(dto);
    }
}
