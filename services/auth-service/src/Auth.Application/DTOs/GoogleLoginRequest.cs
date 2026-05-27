namespace Auth.Application.DTOs
{
    public sealed class GoogleLoginRequest
    {
        public string Code { get; set; } = string.Empty;
        public string RedirectUri { get; set; } = string.Empty;
    }
}
