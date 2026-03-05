using Auth.Application.DTOs;
using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Domain.Enums;
using auth_service.src.Auth.Domain.Events;

namespace Auth.Application.UseCases
{
    public sealed class LoginUseCase
    {
        private readonly IAuthAccountRepository _accountRepo;
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly ILoginAuditRepository _auditRepo;
        private readonly ITokenService _tokenService;
        private readonly IOutboxService _outbox;
        private readonly IPasswordHasher _passwordHasher;

        private const int AccessTokenMinutes = 15;

        public LoginUseCase(
            IAuthAccountRepository accountRepo,
            IRefreshTokenRepository refreshRepo,
            ILoginAuditRepository auditRepo,
            ITokenService tokenService,
            IOutboxService outbox,
            IPasswordHasher passwordHasher)
        {
            _accountRepo = accountRepo;
            _refreshRepo = refreshRepo;
            _auditRepo = auditRepo;
            _tokenService = tokenService;
            _outbox = outbox;
            _passwordHasher = passwordHasher;
        }

        public async Task<LoginResponse> ExecuteAsync(LoginRequest request, string ip, string? userAgent)
        {
            var now = DateTime.UtcNow;

            var email = (request?.Email ?? string.Empty).Trim().ToLowerInvariant();
            var password = request?.Password ?? string.Empty;

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                await SafeAuditAsync(new LoginAuditLog
                {
                    UserId = null,
                    Email = email,
                    Success = false,
                    FailureReason = "Invalid request",
                    IpAddress = ip,
                    UserAgent = userAgent,
                    CreatedAt = now
                });

                throw new ArgumentException("Email và password là bắt buộc.");
            }

            var account = await _accountRepo.GetByEmailAsync(email);
            if (account is null)
                await FailUnauthorizedAsync(null, email, "User not found", ip, userAgent, now);

            if (account!.Status != AccountStatus.Active)
                await FailUnauthorizedAsync(account.UserId, account.Email.Value, $"Account status: {account.Status}", ip, userAgent, now);

            var ok = _passwordHasher.Verify(password, account.Password.Hash, account.Password.Algorithm);
            if (!ok)
                await FailUnauthorizedAsync(account.UserId, account.Email.Value, "Invalid password", ip, userAgent, now);

            await SafeAuditAsync(new LoginAuditLog
            {
                UserId = account.UserId,
                Email = account.Email.Value,
                Success = true,
                FailureReason = null,
                IpAddress = ip,
                UserAgent = userAgent,
                CreatedAt = now
            });

            var accessToken = _tokenService.GenerateAccessToken(account.UserId, account.Email.Value);
            var expiresAt = now.AddMinutes(AccessTokenMinutes);

            var rawRefreshToken = _tokenService.GenerateRawRefreshToken();
            var refreshHash = _tokenService.HashRefreshToken(rawRefreshToken); // bytes[32]

            var refreshToken = RefreshToken.Create(account.UserId, refreshHash, ip, userAgent);
            await _refreshRepo.AddAsync(refreshToken);

            await _outbox.PublishAsync(
                account.UserId,
                nameof(UserLoggedInEvent),
                UserLoggedInEvent.Now(account.UserId, account.Email.Value));

            return new LoginResponse
            {
                UserId = account.UserId,
                Email = account.Email.Value,
                AccessToken = accessToken,
                RefreshToken = rawRefreshToken,
                ExpiresAt = expiresAt
            };
        }

        private async Task FailUnauthorizedAsync(Guid? userId, string email, string reason, string ip, string? ua, DateTime now)
        {
            await SafeAuditAsync(new LoginAuditLog
            {
                UserId = userId,
                Email = email,
                Success = false,
                FailureReason = reason,
                IpAddress = ip,
                UserAgent = ua,
                CreatedAt = now
            });

            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        private async Task SafeAuditAsync(LoginAuditLog log)
        {
            try { await _auditRepo.LogAsync(log); }
            catch { /* audit fail không làm hỏng login */ }
        }
    }
}
