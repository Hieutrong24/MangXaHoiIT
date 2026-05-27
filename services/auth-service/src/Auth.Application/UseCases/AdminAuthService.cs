using Auth.Application.DTOs;
using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Enums;

namespace Auth.Application.UseCases
{
    public sealed class AdminAuthService : IAdminAuthService
    {
        private readonly IAuthAccountRepository _accounts;
        private readonly IUserRoleRepository _userRoles;
        private readonly ILoginAuditRepository _audits;
        private readonly IRoleRepository _roles;

        public AdminAuthService(IAuthAccountRepository accounts, IUserRoleRepository userRoles, ILoginAuditRepository audits, IRoleRepository roles)
        {
            _accounts = accounts;
            _userRoles = userRoles;
            _audits = audits;
            _roles = roles;
        }

        public async Task<IReadOnlyList<AdminAuthAccountDto>> ListAccountsAsync(string? keyword = null, byte? status = null)
        {
            var parsedStatus = status.HasValue && Enum.IsDefined(typeof(AccountStatus), status.Value)
                ? (AccountStatus?)status.Value
                : null;
            var items = await _accounts.ListAsync(keyword, parsedStatus);
            var roles = await _userRoles.ListRoleNamesByUserIdsAsync(items.Select(x => x.UserId));
            return items.Select(x => ToDto(x, roles.TryGetValue(x.UserId, out var list) ? list : Array.Empty<string>())).ToList();
        }

        public async Task<AdminAuthAccountDto?> GetAccountAsync(Guid userId)
        {
            var account = await _accounts.GetByIdAsync(userId);
            if (account is null) return null;
            var roles = await _userRoles.ListRoleNamesByUserIdAsync(userId);
            return ToDto(account, roles);
        }

        public Task<AdminAuthAccountDto?> LockAccountAsync(Guid userId) => ChangeStatusAsync(userId, AccountStatus.Locked);
        public Task<AdminAuthAccountDto?> UnlockAccountAsync(Guid userId) => ChangeStatusAsync(userId, AccountStatus.Active);
        public Task<AdminAuthAccountDto?> DeleteAccountAsync(Guid userId) => ChangeStatusAsync(userId, AccountStatus.Deleted);

        private async Task<AdminAuthAccountDto?> ChangeStatusAsync(Guid userId, AccountStatus target)
        {
            var account = await _accounts.GetByIdAsync(userId);
            if (account is null) return null;
            switch (target)
            {
                case AccountStatus.Active:
                    account.Activate();
                    break;
                case AccountStatus.Locked:
                    account.Lock();
                    break;
                case AccountStatus.Deleted:
                    account.Delete();
                    break;
            }
            await _accounts.UpdateAsync(account);
            var roles = await _userRoles.ListRoleNamesByUserIdAsync(userId);
            return ToDto(account, roles);
        }

        public async Task<IReadOnlyList<AdminLoginAuditDto>> ListAuditLogsAsync(Guid? userId = null, string? email = null, bool? success = null, int limit = 100)
        {
            var items = await _audits.ListAsync(userId, email, success, limit);
            return items.Select(x => new AdminLoginAuditDto(x.Id, x.UserId, x.Email, x.Success, x.FailureReason, x.IpAddress, x.UserAgent, x.CreatedAt)).ToList();
        }

        public async Task<AdminAuthAccountDto?> UpdateRolesAsync(Guid userId, IReadOnlyList<string> roles)
        {
            var account = await _accounts.GetByIdAsync(userId);
            if (account is null) return null;
            var validRoles = (await _roles.ListAsync()).Select(x => x.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var normalized = (roles ?? Array.Empty<string>()).Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).Where(validRoles.Contains).ToList();
            var current = await _userRoles.ListRoleNamesByUserIdAsync(userId);
            foreach (var role in current.Except(normalized, StringComparer.OrdinalIgnoreCase))
                await _userRoles.RemoveRoleByNameAsync(userId, role);
            foreach (var role in normalized.Except(current, StringComparer.OrdinalIgnoreCase))
                await _userRoles.AssignRoleByNameAsync(userId, role);
            var finalRoles = await _userRoles.ListRoleNamesByUserIdAsync(userId);
            return ToDto(account, finalRoles);
        }

        private static AdminAuthAccountDto ToDto(auth_service.src.Auth.Domain.Entities.AuthAccount account, IReadOnlyList<string> roles)
            => new(account.UserId, account.Email.Value, account.IsEmailVerified, account.Status, roles, account.CreatedAt, account.UpdatedAt);
    }
}
