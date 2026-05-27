using auth_service.src.Auth.Domain.Entities;

namespace auth_service.src.Auth.Application.Interfaces.Repositories
{
    public interface IRoleRepository
    {
        Task<IReadOnlyList<AuthRole>> ListAsync();
        Task<AuthRole?> GetByNameAsync(string roleName);
    }
}
