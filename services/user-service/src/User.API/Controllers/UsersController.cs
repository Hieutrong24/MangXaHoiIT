using Microsoft.AspNetCore.Mvc;
using User.API.Extensions;
using User.Application.Common;
using User.Application.DTOs;
using User.Application.Interfaces;

namespace User.API.Controllers;

[ApiController]
[Route("api/users")]
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _svc;
    public UsersController(IUserService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req, CancellationToken ct)
    {
        var r = await _svc.CreateUserAsync(req, ct);
        return ToActionResult(r, createdLocation: v => Url.Action(nameof(GetById), new { userId = v.UserId }));
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetById(Guid userId, CancellationToken ct)
    {
        var r = await _svc.GetUserAsync(userId, ct);
        return ToActionResult(r);
    }

    [HttpPut("{userId:guid}")]
    public async Task<IActionResult> Update(Guid userId, [FromBody] UpdateUserRequest req, CancellationToken ct)
    {
        var r = await _svc.UpdateUserAsync(userId, req, ct);
        return ToActionResult(r);
    }

    [HttpGet("{userId:guid}/profile")]
    public async Task<IActionResult> Profile(Guid userId, [FromQuery] Guid? viewerId, CancellationToken ct)
    {
        var v = viewerId ?? HttpContext.GetActorUserId();
        if (v == Guid.Empty) return BadRequest(new { code = ErrorCodes.Validation, message = "viewerId required or provide X-User-Id." });

        var r = await _svc.GetProfileAsync(userId, v, ct);
        return ToActionResult(r);
    }

    [HttpGet("{userId:guid}/settings")]
    public async Task<IActionResult> GetSettings(Guid userId, CancellationToken ct)
    {
        var r = await _svc.GetSettingsAsync(userId, ct);
        return ToActionResult(r);
    }

    [HttpPut("{userId:guid}/settings")]
    public async Task<IActionResult> UpdateSettings(Guid userId, [FromBody] UpdateUserSettingsRequest req, CancellationToken ct)
    {
        var r = await _svc.UpdateSettingsAsync(userId, req, ct);
        return ToActionResult(r);
    }

    [HttpGet("{userId:guid}/links")]
    public async Task<IActionResult> GetLinks(Guid userId, CancellationToken ct)
    {
        var r = await _svc.GetLinksAsync(userId, ct);
        return ToActionResult(r);
    }

    [HttpPost("{userId:guid}/links")]
    public async Task<IActionResult> AddLink(Guid userId, [FromBody] AddUserLinkRequest req, CancellationToken ct)
    {
        var r = await _svc.AddLinkAsync(userId, req, ct);
        return ToActionResult(r, createdLocation: _ => null);
    }

    [HttpDelete("{userId:guid}/links/{linkId:guid}")]
    public async Task<IActionResult> RemoveLink(Guid userId, Guid linkId, CancellationToken ct)
    {
        var r = await _svc.RemoveLinkAsync(userId, linkId, ct);
        return ToActionResult(r);
    }

    private IActionResult ToActionResult<T>(Result<T> r, Func<T, string?>? createdLocation = null)
    {
        if (r.IsSuccess) return createdLocation is null ? Ok(r.Value) : Created(createdLocation(r.Value!) ?? "", r.Value);
        return ProblemFromError(r.ErrorCode, r.ErrorMessage);
    }

    private IActionResult ToActionResult(Result r)
    {
        if (r.IsSuccess) return NoContent();
        return ProblemFromError(r.ErrorCode, r.ErrorMessage);
    }

    private IActionResult ProblemFromError(string? code, string? message)
    {
        var status =
            code == ErrorCodes.NotFound ? 404 :
            code == ErrorCodes.Conflict ? 409 :
            code == ErrorCodes.Forbidden ? 403 :
            400;

        return StatusCode(status, new { code, message });
    }
    [HttpGet]
    public async Task<IActionResult> ListAll(CancellationToken ct)
    {
        var r = await _svc.ListAllUsersAsync(ct);
        return r.IsSuccess
            ? Ok(r.Value)
            : StatusCode(400, new { r.ErrorCode, r.ErrorMessage });
    }
}
