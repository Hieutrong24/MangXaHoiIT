using Auth.Application.DTOs;
using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;

namespace Auth.Application.UseCases
{
    public sealed class RefreshTokenUseCase
    {
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly IAuthAccountRepository _accountRepo;
        private readonly ITokenService _tokenService;
        private readonly IOutboxService _outbox;

        private const int AccessTokenMinutes = 15;

        public RefreshTokenUseCase(
            IRefreshTokenRepository refreshRepo,
            IAuthAccountRepository accountRepo,
            ITokenService tokenService,
            IOutboxService outbox)
        {
            _refreshRepo = refreshRepo;
            _accountRepo = accountRepo;
            _tokenService = tokenService;
            _outbox = outbox;
        }

        public async Task<RefreshTokenResponse> ExecuteAsync(
            RefreshTokenRequest request,
            string ip,
            string? userAgent)
        {
            var now = DateTime.UtcNow;

            var raw = (request?.RefreshToken ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(raw))
                throw new ArgumentException("RefreshToken là bắt buộc.");

            // 1) Tìm refresh token theo hash (BINARY(32))
            var hash = _tokenService.HashRefreshToken(raw); // byte[32]
            var stored = await _refreshRepo.GetByHashAsync(hash);

            // Không tiết lộ lý do
            if (stored is null)
                throw new UnauthorizedAccessException("Invalid refresh token.");

            // 2) Check revoked/expired
            if (stored.IsRevoked || stored.IsExpired)
                throw new UnauthorizedAccessException("Invalid refresh token.");

            // 3) Load account (đảm bảo user còn tồn tại)
            var account = await _accountRepo.GetByIdAsync(stored.UserId);
            if (account is null)
                throw new UnauthorizedAccessException("Invalid refresh token.");

            // 4) Rotate refresh token (khuyến nghị)
            // - revoke token cũ
            stored.Revoke(ip, userAgent);

            // - tạo token mới
            var newRaw = _tokenService.GenerateRawRefreshToken();
            var newHash = _tokenService.HashRefreshToken(newRaw); // byte[32]
            var newToken = RefreshToken.Create(account.UserId, newHash, ip, userAgent);

            stored.ReplaceBy(newToken.TokenId);

            // Persist
            await _refreshRepo.UpdateAsync(stored);
            await _refreshRepo.AddAsync(newToken);

            // 5) New access token
            var accessToken = _tokenService.GenerateAccessToken(account.UserId, account.Email.Value);
            var expiresAt = now.AddMinutes(AccessTokenMinutes);

            // (Optional) outbox event: RefreshToken rotated
            await _outbox.PublishAsync(
                account.UserId,
                "RefreshTokenRotated",
                new
                {
                    UserId = account.UserId,
                    Email = account.Email.Value,
                    OccurredAtUtc = now
                });

            return new RefreshTokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = newRaw,
                ExpiresAt = expiresAt
            };
        }
    }
}
