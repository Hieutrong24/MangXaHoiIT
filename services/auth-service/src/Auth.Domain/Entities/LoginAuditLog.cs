using System;

namespace auth_service.src.Auth.Domain.Entities
{
    public class LoginAuditLog
    {
        public long Id { get; set; } 
        public Guid? UserId { get; set; }

        public string Email { get; set; } = default!;
        public bool Success { get; set; }

        public string? FailureReason { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
