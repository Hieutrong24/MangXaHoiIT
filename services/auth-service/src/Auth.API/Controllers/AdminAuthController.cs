using Auth.Application.DTOs;
using auth_service.src.Auth.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Auth.API.Controllers
{
    [ApiController]
    [Route("api/admin/auth")]
    public sealed class AdminAuthController : ControllerBase
    {
        private readonly IAdminAuthService _svc;

        public AdminAuthController(IAdminAuthService svc)
        {
            _svc = svc;
        }

        [HttpGet("accounts")]
        public Task<IReadOnlyList<AdminAuthAccountDto>> ListAccounts([FromQuery] string? keyword, [FromQuery] byte? status)
            => _svc.ListAccountsAsync(keyword, status);

        [HttpGet("accounts/{userId:guid}")]
        public async Task<IActionResult> GetAccount(Guid userId)
        {
            var item = await _svc.GetAccountAsync(userId);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpPatch("accounts/{userId:guid}/lock")]
        public async Task<IActionResult> Lock(Guid userId)
        {
            var item = await _svc.LockAccountAsync(userId);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpPatch("accounts/{userId:guid}/unlock")]
        public async Task<IActionResult> Unlock(Guid userId)
        {
            var item = await _svc.UnlockAccountAsync(userId);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpDelete("accounts/{userId:guid}")]
        public async Task<IActionResult> Delete(Guid userId)
        {
            var item = await _svc.DeleteAccountAsync(userId);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpGet("audit-logs")]
        public Task<IReadOnlyList<AdminLoginAuditDto>> ListAuditLogs([FromQuery] Guid? userId, [FromQuery] string? email, [FromQuery] bool? success, [FromQuery] int limit = 100)
            => _svc.ListAuditLogsAsync(userId, email, success, limit);

        [HttpPut("accounts/{userId:guid}/roles")]
        public async Task<IActionResult> UpdateRoles(Guid userId, [FromBody] UpdateUserRolesRequest request)
        {
            var item = await _svc.UpdateRolesAsync(userId, request.Roles ?? Array.Empty<string>());
            return item is null ? NotFound() : Ok(item);
        }
    }
}
