using Auth.Application.DTOs;
using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;

namespace Auth.Application.UseCases
{
    public sealed class RegisterUseCase
    {
        private readonly IAuthAccountRepository _accountRepo;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IUserRoleRepository _userRoleRepo;
        private readonly IOutboxService _outbox;

        public RegisterUseCase(
            IAuthAccountRepository accountRepo,
            IPasswordHasher passwordHasher,
            IUserRoleRepository userRoleRepo,
            IOutboxService outbox)
        {
            _accountRepo = accountRepo;
            _passwordHasher = passwordHasher;
            _userRoleRepo = userRoleRepo;
            _outbox = outbox;
        }

        public async Task<RegisterResponse> ExecuteAsync(RegisterRequest request)
        {
            var email = (request?.Email ?? string.Empty).Trim().ToLowerInvariant();
            var password = request?.Password ?? string.Empty;
            var displayName = (request?.DisplayName ?? string.Empty).Trim();

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Email và password là bắt buộc.");

            if (password.Length < 6)
                throw new ArgumentException("Password phải có ít nhất 6 ký tự.");

            if (await _accountRepo.GetByEmailAsync(email) is not null)
                throw new ArgumentException("Email đã được đăng ký.");

            var hashed = _passwordHasher.Hash(password);
            var account = AuthAccount.CreateNew(email, hashed.Hash, hashed.Algo);
            await _accountRepo.AddAsync(account);
            await _userRoleRepo.AssignRoleByNameAsync(account.UserId, "student");

            var roles = await _userRoleRepo.ListRoleNamesByUserIdAsync(account.UserId);

            await _outbox.PublishAsync(
                account.UserId,
                "Auth.AccountCreated",
                new
                {
                    userId = account.UserId,
                    email = account.Email.Value,
                    displayName,
                    createdAt = account.CreatedAt
                });

            return new RegisterResponse
            {
                UserId = account.UserId,
                Email = account.Email.Value,
                DisplayName = string.IsNullOrWhiteSpace(displayName) ? null : displayName,
                IsEmailVerified = account.IsEmailVerified,
                Roles = roles
            };
        }
    }
}
