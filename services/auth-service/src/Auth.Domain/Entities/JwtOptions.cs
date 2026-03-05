using System;

namespace auth_service.src.Auth.Domain.Entities
{
    public sealed class JwtOptions
    {
        public string Issuer { get; init; } = string.Empty;
        public string Audience { get; init; } = string.Empty;
        public string SigningKey { get; init; } = string.Empty;

        public int AccessTokenMinutes { get; init; } = 15;

        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(Issuer)) throw new ArgumentException("Issuer is required.");
            if (string.IsNullOrWhiteSpace(Audience)) throw new ArgumentException("Audience is required.");
            if (string.IsNullOrWhiteSpace(SigningKey)) throw new ArgumentException("SigningKey is required.");
            if (AccessTokenMinutes <= 0) throw new ArgumentException("AccessTokenMinutes must be > 0.");
        }
    }
}
