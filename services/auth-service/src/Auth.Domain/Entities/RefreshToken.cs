using System;

namespace auth_service.src.Auth.Domain.Entities
{
    public class RefreshToken
    {
        public Guid TokenId { get; private set; }
        public Guid UserId { get; private set; }

        public byte[] TokenHash { get; private set; } = default!;

        public DateTime IssuedAt { get; private set; }
        public DateTime ExpiresAt { get; private set; }

        public DateTime? RevokedAt { get; private set; }
        public Guid? ReplacedByTokenId { get; private set; }

        public string? DeviceId { get; private set; }
        public string? IpAddress { get; private set; }
        public string? UserAgent { get; private set; }

        public bool IsRevoked => RevokedAt.HasValue;
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

        // EF Core
        private RefreshToken() { }

        private RefreshToken(Guid userId, byte[] tokenHash, DateTime issuedAt, DateTime expiresAt, string? ip, string? ua, string? deviceId)
        {
            TokenId = Guid.NewGuid();
            UserId = userId;
            TokenHash = tokenHash;
            IssuedAt = issuedAt;
            ExpiresAt = expiresAt;
            IpAddress = ip;
            UserAgent = ua;
            DeviceId = deviceId;
        }

        /// <summary>
        /// Create refresh token theo cách bạn đang gọi trong UseCase.
        /// Default TTL: 30 ngày (bạn có thể đổi).
        /// </summary>
        public static RefreshToken Create(Guid userId, byte[] tokenHash, string? ip, string? userAgent, int ttlDays = 30, string? deviceId = null)
        {
            if (userId == Guid.Empty) throw new ArgumentException("UserId is required.", nameof(userId));
            ValidateTokenHash(tokenHash);

            var now = DateTime.UtcNow;
            var expires = now.AddDays(ttlDays);

            return new RefreshToken(userId, tokenHash, now, expires, ip, userAgent, deviceId);
        }

        public void Revoke(string? ip = null, string? userAgent = null)
        {
            if (IsRevoked) return;

            RevokedAt = DateTime.UtcNow;
            IpAddress = ip ?? IpAddress;
            UserAgent = userAgent ?? UserAgent;
        }

        public void ReplaceBy(Guid newTokenId)
        {
            if (newTokenId == Guid.Empty) throw new ArgumentException("New token id is required.", nameof(newTokenId));
            ReplacedByTokenId = newTokenId;
        }

        private static void ValidateTokenHash(byte[] tokenHash)
        {
            if (tokenHash is null) throw new ArgumentNullException(nameof(tokenHash));
            if (tokenHash.Length != 32)
                throw new ArgumentException("TokenHash must be 32 bytes (SHA-256) to match BINARY(32).", nameof(tokenHash));
        }
    }
}
