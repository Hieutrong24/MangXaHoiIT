namespace Auth.Application.DTOs
{
    public sealed class LoginResponse
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;

        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
    }
}
