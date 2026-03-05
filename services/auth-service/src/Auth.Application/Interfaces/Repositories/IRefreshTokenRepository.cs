using auth_service.src.Auth.Domain.Entities;

namespace auth_service.src.Auth.Application.Interfaces.Repositories
{
    public interface IRefreshTokenRepository
    {
        Task AddAsync(RefreshToken token);

        /// <summary>
        /// Tìm refresh token theo hash (SHA-256 bytes[32]) - khớp DB TokenHash BINARY(32)
        /// </summary>
        Task<RefreshToken?> GetByHashAsync(byte[] tokenHash);

        Task UpdateAsync(RefreshToken token);
    }
}
