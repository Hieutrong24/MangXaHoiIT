using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Validation;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/submissions")]
public sealed class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _svc;
    public SubmissionsController(ISubmissionService svc) => _svc = svc;

    public sealed record CreateSubmissionReq(Guid ProblemId, Guid UserId, int LanguageId, string SourceCode);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSubmissionReq req, CancellationToken ct)
    {
        CreateSubmissionValidator.Validate(req.SourceCode);
        var dto = await _svc.CreateAsync(new CreateSubmissionRequest(req.ProblemId, req.UserId, req.LanguageId, req.SourceCode), ct);
        return Accepted(dto);
    }

    [HttpGet("{id:guid}")]
    public Task<CodeJudge.Application.DTOs.SubmissionDto?> Get(Guid id, CancellationToken ct) => _svc.GetAsync(id, ct);

    [HttpGet("{id:guid}/result")]
    public Task<CodeJudge.Application.DTOs.JudgeResultDto?> Result(Guid id, CancellationToken ct) => _svc.GetResultAsync(id, ct);
}
