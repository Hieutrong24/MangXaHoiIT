using auth_service.src.Auth.Domain.Entities;

namespace auth_service.src.Auth.Application.Interfaces.Repositories
{
    public interface IAuthAccountRepository
    {
        Task<AuthAccount?> GetByEmailAsync(string email);
        Task<AuthAccount?> GetByIdAsync(Guid userId);
        Task UpdateAsync(AuthAccount account);
    }
}
