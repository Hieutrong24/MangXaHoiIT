using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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

        public string GenerateAccessToken(Guid userId, string email)
        {
            var now = DateTime.UtcNow;

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SigningKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                notBefore: now,
                expires: now.AddMinutes(_settings.AccessTokenMinutes),
                signingCredentials: creds
            );

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
    }
}
