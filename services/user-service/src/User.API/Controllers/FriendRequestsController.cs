using Microsoft.AspNetCore.Mvc;
using User.API.Extensions;
using User.Application.Common;
using User.Application.DTOs;
using User.Application.Interfaces;

namespace User.API.Controllers;

[ApiController]
[Route("api/friend-requests")]
public sealed class FriendRequestsController : ControllerBase
{
    private readonly IUserService _svc;
    public FriendRequestsController(IUserService svc) => _svc = svc;

    [HttpPost("{toUserId:guid}")]
    public async Task<IActionResult> Send(Guid toUserId, [FromBody] SendFriendRequestRequest req, [FromQuery] Guid? actorUserId, CancellationToken ct)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.SendFriendRequestAsync(actor, toUserId, req, ct);
        return r.IsSuccess ? Ok(r.Value) : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    [HttpPost("{requestId:guid}/accept")]
    public async Task<IActionResult> Accept(Guid requestId, [FromQuery] Guid? actorUserId, CancellationToken ct)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.AcceptFriendRequestAsync(actor, requestId, ct);
        return r.IsSuccess ? NoContent() : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    [HttpPost("{requestId:guid}/reject")]
    public async Task<IActionResult> Reject(Guid requestId, [FromQuery] Guid? actorUserId, CancellationToken ct)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.RejectFriendRequestAsync(actor, requestId, ct);
        return r.IsSuccess ? NoContent() : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    [HttpPost("{requestId:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid requestId, [FromQuery] Guid? actorUserId, CancellationToken ct)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.CancelFriendRequestAsync(actor, requestId, ct);
        return r.IsSuccess ? NoContent() : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }
    [HttpGet("incoming")]
    public async Task<IActionResult> Incoming([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] Guid? actorUserId = null, CancellationToken ct = default)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.ListIncomingFriendRequestsAsync(actor, page, pageSize, ct);
        return r.IsSuccess ? Ok(r.Value) : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    [HttpGet("outgoing")]
    public async Task<IActionResult> Outgoing([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] Guid? actorUserId = null, CancellationToken ct = default)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        var r = await _svc.ListOutgoingFriendRequestsAsync(actor, page, pageSize, ct);
        return r.IsSuccess ? Ok(r.Value) : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }
    private static int Map(string? code) =>
        code == ErrorCodes.NotFound ? 404 :
        code == ErrorCodes.Conflict ? 409 :
        code == ErrorCodes.Forbidden ? 403 : 400;
}
