using auth_service.src.Auth.Domain.Entities;

namespace auth_service.src.Auth.Application.Interfaces.Repositories
{
    public interface IUserRoleRepository
    {
        Task<bool> HasRoleAsync(Guid userId, int roleId);
        Task<IReadOnlyList<string>> ListRoleNamesByUserIdAsync(Guid userId);
        Task<Dictionary<Guid, IReadOnlyList<string>>> ListRoleNamesByUserIdsAsync(IEnumerable<Guid> userIds);
        Task AssignAsync(AuthUserRole ur);
        Task<bool> AssignRoleByNameAsync(Guid userId, string roleName);
        Task<bool> RemoveRoleByNameAsync(Guid userId, string roleName);
    }
}
