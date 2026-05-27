using System;
using System.Collections.Generic;

namespace Auth.Application.DTOs
{
    public sealed class RegisterResponse
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public bool IsEmailVerified { get; set; }
        public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();
    }
}
