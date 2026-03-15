using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Application.Interfaces.Repositories;

namespace Auth.Application.UseCases
{
    public sealed class LogoutUseCase
    {
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly ITokenService _tokenService;

        public LogoutUseCase(IRefreshTokenRepository refreshRepo, ITokenService tokenService)
        {
            _refreshRepo = refreshRepo;
            _tokenService = tokenService;
        }

        public async Task ExecuteAsync(string rawRefreshToken, string? ip, string? userAgent)
        {
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
                return;

            var hash = _tokenService.HashRefreshToken(rawRefreshToken); // bytes[32]
            var token = await _refreshRepo.GetByHashAsync(hash);

            if (token is null)
                return;

            token.Revoke(ip, userAgent);
            await _refreshRepo.UpdateAsync(token);
        }
    }
}
