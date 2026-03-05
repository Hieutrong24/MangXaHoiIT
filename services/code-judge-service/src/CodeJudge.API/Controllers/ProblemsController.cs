using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Validation;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/problems")]
public sealed class ProblemsController : ControllerBase
{
    private readonly IProblemService _svc;
    public ProblemsController(IProblemService svc) => _svc = svc;

    [HttpGet]
    public Task<List<CodeJudge.Application.DTOs.ProblemDto>> List(CancellationToken ct) => _svc.ListAsync(ct);

    [HttpGet("{id:guid}")]
    public Task<CodeJudge.Application.DTOs.ProblemDto?> Get(Guid id, CancellationToken ct) => _svc.GetAsync(id, ct);

    public sealed record CreateProblemReq(
        string Title,
        string Slug,
        byte Difficulty,
        int TimeLimitMs,
        int MemoryLimitMB,
        string Statement,
        Guid CreatedByUserId,
        bool IsPublic = true,
        byte Status = 0,                 // Draft mặc định
        string? Tags = null
    );

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProblemReq req, CancellationToken ct)
    {
        CreateProblemValidator.Validate(req.Title, req.Slug, req.Difficulty, req.TimeLimitMs, req.MemoryLimitMB);

        var dto = await _svc.CreateAsync(new CreateProblemRequest(
            req.Title, req.Slug, req.Difficulty, req.TimeLimitMs, req.MemoryLimitMB, req.Statement, req.CreatedByUserId, req.IsPublic
        ), ct);

        return CreatedAtAction(nameof(Get), new { id = dto.ProblemId }, dto);
    }
}
