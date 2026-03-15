namespace auth_service.src.Auth.Application.Interfaces
{
    public interface ITokenService
    {
       
        string GenerateAccessToken(Guid userId, string email);

       
        string GenerateRawRefreshToken();
        byte[] HashRefreshToken(string rawRefreshToken);
    }
}
