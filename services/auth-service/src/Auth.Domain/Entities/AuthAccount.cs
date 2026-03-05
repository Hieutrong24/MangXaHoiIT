using System;
using auth_service.src.Auth.Domain.Enums;
using auth_service.src.Auth.Domain.ValueObjects;

namespace auth_service.src.Auth.Domain.Entities
{
    public class AuthAccount
    {
        public Guid UserId { get; private set; }

        public Email Email { get; private set; } = default!;
        public PasswordHash Password { get; private set; } = default!;

        public bool IsEmailVerified { get; private set; }
        public AccountStatus Status { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        // EF Core
        private AuthAccount() { }

        private AuthAccount(Guid userId, Email email, PasswordHash password)
        {
            UserId = userId;
            Email = email;
            Password = password;
            IsEmailVerified = false;
            Status = AccountStatus.Active;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public static AuthAccount CreateNew(string email, byte[] passwordHash, string passwordAlgo)
        {
            return new AuthAccount(
                Guid.NewGuid(),
                Email.Create(email),
                PasswordHash.Create(passwordHash, passwordAlgo));
        }

        public void VerifyEmail()
        {
            IsEmailVerified = true;
            Touch();
        }

        public void ChangePassword(byte[] newHash, string algo)
        {
            Password = PasswordHash.Create(newHash, algo);
            Touch();
        }

        public void Lock()
        {
            if (Status == AccountStatus.Deleted) return;
            Status = AccountStatus.Locked;
            Touch();
        }

        public void Activate()
        {
            if (Status == AccountStatus.Deleted) return;
            Status = AccountStatus.Active;
            Touch();
        }

        public void Delete()
        {
            Status = AccountStatus.Deleted;
            Touch();
        }

        private void Touch()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
