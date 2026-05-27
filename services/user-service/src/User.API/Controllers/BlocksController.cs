using Microsoft.AspNetCore.Mvc;
using User.API.Extensions;
using User.Application.Common;
using User.Application.Interfaces;

namespace User.API.Controllers;

[ApiController]
[Route("api/blocks")]
public sealed class BlocksController : ControllerBase
{
    private readonly IUserService _svc;
    public BlocksController(IUserService svc) => _svc = svc;

    [HttpPost("{blockedUserId:guid}")]
    public async Task<IActionResult> Block(Guid blockedUserId, [FromQuery] Guid? actorUserId, CancellationToken ct)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.BlockAsync(actor, blockedUserId, ct);
        return r.IsSuccess ? NoContent() : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    [HttpDelete("{blockedUserId:guid}")]
    public async Task<IActionResult> Unblock(Guid blockedUserId, [FromQuery] Guid? actorUserId, CancellationToken ct)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.UnblockAsync(actor, blockedUserId, ct);
        return r.IsSuccess ? NoContent() : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    private static int Map(string? code) =>
        code == ErrorCodes.NotFound ? 404 :
        code == ErrorCodes.Conflict ? 409 :
        code == ErrorCodes.Forbidden ? 403 : 400;
}
