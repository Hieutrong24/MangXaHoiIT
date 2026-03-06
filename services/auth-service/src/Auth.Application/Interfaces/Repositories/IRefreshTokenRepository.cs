using auth_service.src.Auth.Domain.Entities;

namespace auth_service.src.Auth.Application.Interfaces.Repositories
{
    public interface IRefreshTokenRepository
    {
        Task AddAsync(RefreshToken token);

       
        Task<RefreshToken?> GetByHashAsync(byte[] tokenHash);

        Task UpdateAsync(RefreshToken token);
    }
}
