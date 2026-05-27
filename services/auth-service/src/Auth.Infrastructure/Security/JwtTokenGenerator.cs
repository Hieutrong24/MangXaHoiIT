using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Infrastructure.Configurations;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace auth_service.src.Auth.Infrastructure.Security
{
    public class JwtTokenGenerator : ITokenService
    {
        private readonly JwtSettings _settings;

        public JwtTokenGenerator(IOptions<JwtSettings> settings)
        {
            _settings = settings.Value;
        }

        public string GenerateAccessToken(Guid userId, string email, IReadOnlyCollection<string>? roles = null)
        {
            var now = DateTime.UtcNow;
            var normalizedRoles = (roles ?? Array.Empty<string>())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var payload = new JwtPayload();

            AddOrSet(payload, JwtRegisteredClaimNames.Sub, userId.ToString());
            AddOrSet(payload, JwtRegisteredClaimNames.Email, email);
            AddOrSet(payload, JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString());
            AddOrSet(payload, JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds());
            AddOrSet(payload, JwtRegisteredClaimNames.Nbf, new DateTimeOffset(now).ToUnixTimeSeconds());
            AddOrSet(payload, JwtRegisteredClaimNames.Exp, new DateTimeOffset(now.AddMinutes(_settings.AccessTokenMinutes)).ToUnixTimeSeconds());
            AddOrSet(payload, JwtRegisteredClaimNames.Iss, _settings.Issuer);
            AddOrSet(payload, JwtRegisteredClaimNames.Aud, _settings.Audience);

            // Custom claims used by api-gateway and frontend clients.
            AddOrSet(payload, "userId", userId.ToString());
            AddOrSet(payload, "roles", normalizedRoles);

            if (normalizedRoles.Length == 1)
            {
                AddOrSet(payload, "role", normalizedRoles[0]);
            }
            else if (normalizedRoles.Length > 1)
            {
                AddOrSet(payload, "role", normalizedRoles);
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SigningKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(new JwtHeader(creds), payload);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRawRefreshToken()
        {
            Span<byte> bytes = stackalloc byte[32];
            RandomNumberGenerator.Fill(bytes);
            return Base64UrlEncoder.Encode(bytes.ToArray());
        }

        public byte[] HashRefreshToken(string rawRefreshToken)
        {
            return SHA256.HashData(Encoding.UTF8.GetBytes(rawRefreshToken));
        }

        private static void AddOrSet(JwtPayload payload, string key, object value)
        {
            if (payload.ContainsKey(key))
            {
                payload[key] = value;
                return;
            }

            payload.Add(key, value);
        }
    }
}
