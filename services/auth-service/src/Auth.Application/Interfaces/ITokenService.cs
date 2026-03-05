namespace auth_service.src.Auth.Application.Interfaces
{
    public interface ITokenService
    {
        // Access token (JWT)
        string GenerateAccessToken(Guid userId, string email);

        // Refresh token raw + hash (SHA-256 bytes[32])
        string GenerateRawRefreshToken();
        byte[] HashRefreshToken(string rawRefreshToken);
    }
}
