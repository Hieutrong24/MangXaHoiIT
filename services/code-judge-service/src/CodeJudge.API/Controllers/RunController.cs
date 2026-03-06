using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/codejudge/run")]
public class RunController : ControllerBase
{
    private readonly IJudge0Service _judge0;

    public RunController(IJudge0Service judge0)
    {
        _judge0 = judge0;
    }

    [HttpPost]
    public async Task<IActionResult> Run([FromBody] Judge0RequestDto request, CancellationToken ct)
    {
        var result = await _judge0.RunAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] Judge0RequestDto request, CancellationToken ct)
    {
        var result = await _judge0.SubmitAsync(request, ct);
        return Ok(result);
    }
    [HttpGet("{token}")]
    public async Task<IActionResult> GetResult([FromRoute] string token, CancellationToken ct)
    {
        var result = await _judge0.GetResultAsync(token, ct);
        return Ok(result);
    }
}