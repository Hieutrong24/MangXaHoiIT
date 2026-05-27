namespace auth_service.src.Auth.Application.Interfaces
{
    public sealed record GoogleUserInfo(string Email, bool EmailVerified, string? Name, string? Picture);

    public interface IGoogleOAuthClient
    {
        Task<GoogleUserInfo> GetUserInfoAsync(string code, string redirectUri, CancellationToken cancellationToken = default);
    }
}
