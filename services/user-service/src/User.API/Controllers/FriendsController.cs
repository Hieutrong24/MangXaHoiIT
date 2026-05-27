using Microsoft.AspNetCore.Mvc;
using User.API.Extensions;
using User.Application.Common;
using User.Application.DTOs;
using User.Application.Interfaces;

namespace User.API.Controllers;

[ApiController]
[Route("api/friends")]
public sealed class FriendsController : ControllerBase
{
    private readonly IUserService _svc;
    public FriendsController(IUserService svc) => _svc = svc;

    // GET /api/friends?actorUserId=...&page=1&pageSize=20
    [HttpGet]
    public async Task<IActionResult> ListFriends(
        [FromQuery] Guid? actorUserId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty)
            return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        page = page <= 0 ? 1 : page;
        pageSize = pageSize is <= 0 or > 100 ? 20 : pageSize;

        // Bạn sẽ implement ở service
        var r = await _svc.ListFriendsAsync(actor, page, pageSize, ct);
        return r.IsSuccess ? Ok(r.Value) : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    // GET /api/friends/suggestions?actorUserId=...&limit=10
    [HttpGet("suggestions")]
    public async Task<IActionResult> Suggestions(
        [FromQuery] Guid? actorUserId,
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        var actor = actorUserId ?? HttpContext.GetActorUserId();
        if (actor == Guid.Empty)
            return BadRequest(new { code = ErrorCodes.Validation, message = "actorUserId required or provide X-User-Id." });

        limit = limit is <= 0 or > 50 ? 10 : limit;

        var r = await _svc.ListFriendSuggestionsAsync(actor, limit, ct);
        return r.IsSuccess ? Ok(r.Value) : StatusCode(Map(r.ErrorCode), new { r.ErrorCode, r.ErrorMessage });
    }

    private static int Map(string? code) =>
        code == ErrorCodes.NotFound ? 404 :
        code == ErrorCodes.Conflict ? 409 :
        code == ErrorCodes.Forbidden ? 403 : 400;
}