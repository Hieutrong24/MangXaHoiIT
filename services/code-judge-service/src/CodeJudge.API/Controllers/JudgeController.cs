using CodeJudge.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/judge")]
public sealed class JudgeController : ControllerBase
{
    private readonly ISubmissionService _svc;
    public JudgeController(ISubmissionService svc) => _svc = svc;

    [HttpPost("{id:guid}/rejudge")]
    public async Task<IActionResult> Rejudge(Guid id, CancellationToken ct)
    {
        await _svc.RejudgeAsync(id, ct);
        return Accepted();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _svc.CancelAsync(id, ct);
        return Accepted();
    }
}
