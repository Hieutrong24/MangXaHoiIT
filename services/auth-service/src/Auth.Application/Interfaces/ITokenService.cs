namespace auth_service.src.Auth.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(Guid userId, string email, IReadOnlyCollection<string>? roles = null);
        string GenerateRawRefreshToken();
        byte[] HashRefreshToken(string rawRefreshToken);
    }
}
