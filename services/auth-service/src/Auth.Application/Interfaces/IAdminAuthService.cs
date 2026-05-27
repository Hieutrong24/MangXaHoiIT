using Auth.Application.DTOs;

namespace auth_service.src.Auth.Application.Interfaces
{
    public interface IAdminAuthService
    {
        Task<IReadOnlyList<AdminAuthAccountDto>> ListAccountsAsync(string? keyword = null, byte? status = null);
        Task<AdminAuthAccountDto?> GetAccountAsync(Guid userId);
        Task<AdminAuthAccountDto?> LockAccountAsync(Guid userId);
        Task<AdminAuthAccountDto?> UnlockAccountAsync(Guid userId);
        Task<AdminAuthAccountDto?> DeleteAccountAsync(Guid userId);
        Task<IReadOnlyList<AdminLoginAuditDto>> ListAuditLogsAsync(Guid? userId = null, string? email = null, bool? success = null, int limit = 100);
        Task<AdminAuthAccountDto?> UpdateRolesAsync(Guid userId, IReadOnlyList<string> roles);
    }
}
