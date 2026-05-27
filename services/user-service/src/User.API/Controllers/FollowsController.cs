using Microsoft.AspNetCore.Mvc;
using User.API.Extensions;
using User.Application.Common;
using User.Application.Interfaces;

namespace User.API.Controllers;

[ApiController]
[Route("api/follows")]
public sealed class FollowsController : ControllerBase
{
    private readonly IUserService _svc;
    public FollowsController(IUserService svc) => _svc = svc;

    [HttpPost("{targetUserId:guid}")]
    public async Task<IActionResult> Follow(Guid targetUserId, [FromQuery] Guid? actorUserId, CancellationToken ct)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.FollowAsync(actor, targetUserId, ct);
        return r.IsSuccess ? NoContent() : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    [HttpDelete("{targetUserId:guid}")]
    public async Task<IActionResult> Unfollow(Guid targetUserId, [FromQuery] Guid? actorUserId, CancellationToken ct)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.UnfollowAsync(actor, targetUserId, ct);
        return r.IsSuccess ? NoContent() : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    private static int Map(string? code) =>
        code == ErrorCodes.NotFound ? 404 :
        code == ErrorCodes.Conflict ? 409 :
        code == ErrorCodes.Forbidden ? 403 : 400;
}
