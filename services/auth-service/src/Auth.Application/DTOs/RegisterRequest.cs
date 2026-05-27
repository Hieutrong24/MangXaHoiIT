namespace Auth.Application.DTOs
{
    public sealed class RegisterRequest
    {
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}
