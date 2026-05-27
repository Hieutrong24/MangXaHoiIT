using System;

namespace auth_service.src.Auth.Domain.Entities
{
    public class AuthUserRole
    {
        public Guid UserId { get; private set; }
        public int RoleId { get; private set; }
        public DateTime AssignedAt { get; private set; }

        // EF Core
        private AuthUserRole() { }

        private AuthUserRole(Guid userId, int roleId)
        {
            UserId = userId;
            RoleId = roleId;
            AssignedAt = DateTime.UtcNow;
        }

        public static AuthUserRole Assign(Guid userId, int roleId)
        {
            if (userId == Guid.Empty) throw new ArgumentException("UserId is required.", nameof(userId));
            if (roleId <= 0) throw new ArgumentException("RoleId must be > 0.", nameof(roleId));
            return new AuthUserRole(userId, roleId);
        }
    }
}
