namespace Auth.Application.DTOs
{
    public sealed class LoginRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}
