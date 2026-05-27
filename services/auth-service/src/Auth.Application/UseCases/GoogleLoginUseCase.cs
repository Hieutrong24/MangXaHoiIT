using Auth.Application.DTOs;
using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Domain.Enums;
using auth_service.src.Auth.Domain.Events;

namespace Auth.Application.UseCases
{
    public sealed class GoogleLoginUseCase
    {
        private readonly IGoogleOAuthClient _google;
        private readonly IAuthAccountRepository _accountRepo;
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly ILoginAuditRepository _auditRepo;
        private readonly ITokenService _tokenService;
        private readonly IOutboxService _outbox;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IUserRoleRepository _userRoleRepo;

        private const int AccessTokenMinutes = 15;

        public GoogleLoginUseCase(
            IGoogleOAuthClient google,
            IAuthAccountRepository accountRepo,
            IRefreshTokenRepository refreshRepo,
            ILoginAuditRepository auditRepo,
            ITokenService tokenService,
            IOutboxService outbox,
            IPasswordHasher passwordHasher,
            IUserRoleRepository userRoleRepo)
        {
            _google = google;
            _accountRepo = accountRepo;
            _refreshRepo = refreshRepo;
            _auditRepo = auditRepo;
            _tokenService = tokenService;
            _outbox = outbox;
            _passwordHasher = passwordHasher;
            _userRoleRepo = userRoleRepo;
        }

        public async Task<LoginResponse> ExecuteAsync(GoogleLoginRequest request, string ip, string? userAgent, CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            var code = (request?.Code ?? string.Empty).Trim();
            var redirectUri = (request?.RedirectUri ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(redirectUri))
                throw new ArgumentException("Google code và redirectUri là bắt buộc.");

            var profile = await _google.GetUserInfoAsync(code, redirectUri, cancellationToken);
            var email = profile.Email.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(email) || !profile.EmailVerified)
                throw new UnauthorizedAccessException("Google account chưa xác minh email.");

            var account = await _accountRepo.GetByEmailAsync(email);
            if (account is null)
            {
                var password = _passwordHasher.Hash($"google:{Guid.NewGuid():N}:{email}");
                account = AuthAccount.CreateNew(email, password.Hash, password.Algo);
                account.VerifyEmail();
                await _accountRepo.AddAsync(account);
                await _userRoleRepo.AssignRoleByNameAsync(account.UserId, "student");
            }
            else if (!account.IsEmailVerified)
            {
                account.VerifyEmail();
                await _accountRepo.UpdateAsync(account);
            }

            if (account.Status != AccountStatus.Active)
                throw new UnauthorizedAccessException($"Account status: {account.Status}");

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

            var roles = await _userRoleRepo.ListRoleNamesByUserIdAsync(account.UserId);
            var accessToken = _tokenService.GenerateAccessToken(account.UserId, account.Email.Value, roles);
            var rawRefreshToken = _tokenService.GenerateRawRefreshToken();
            var refreshHash = _tokenService.HashRefreshToken(rawRefreshToken);

            await _refreshRepo.AddAsync(RefreshToken.Create(account.UserId, refreshHash, ip, userAgent));

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
                ExpiresAt = now.AddMinutes(AccessTokenMinutes),
                Roles = roles
            };
        }

        private async Task SafeAuditAsync(LoginAuditLog log)
        {
            try { await _auditRepo.LogAsync(log); }
            catch { }
        }
    }
}
