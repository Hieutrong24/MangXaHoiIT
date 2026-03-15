using System;

namespace auth_service.src.Auth.Domain.Entities
{
    public class AuthRole
    {
        public int RoleId { get; private set; }
        public string Name { get; private set; } = default!;
        public string? Description { get; private set; }

        // EF Core
        private AuthRole() { }

        private AuthRole(string name, string? description)
        {
            Name = NormalizeName(name);
            Description = description;
        }

        public static AuthRole Create(string name, string? description = null)
            => new(name, description);

        public void Rename(string name)
        {
            Name = NormalizeName(name);
        }

        public void UpdateDescription(string? description)
        {
            Description = description;
        }

        private static string NormalizeName(string name)
        {
            name = (name ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Role name is required.", nameof(name));
            if (name.Length > 50)
                throw new ArgumentException("Role name max length is 50.", nameof(name));
            return name;
        }
    }
}
