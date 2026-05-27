using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Domain.Enums;

namespace auth_service.src.Auth.Application.Interfaces.Repositories
{
    public interface IAuthAccountRepository
    {
        Task<AuthAccount?> GetByEmailAsync(string email);
        Task<AuthAccount?> GetByIdAsync(Guid userId);
        Task<IReadOnlyList<AuthAccount>> ListAsync(string? keyword = null, AccountStatus? status = null);
        Task AddAsync(AuthAccount account);
        Task UpdateAsync(AuthAccount account);
    }
}
