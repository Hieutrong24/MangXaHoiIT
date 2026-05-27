using System;

namespace auth_service.src.Auth.Domain.ValueObjects
{
    public sealed class Email : IEquatable<Email>
    {
        public string Value { get; private set; } = default!;

        // EF Core
        private Email() { }

        private Email(string value)
        {
            Value = value;
        }

        public static Email Create(string? raw)
        {
            var normalized = Normalize(raw);
            if (string.IsNullOrWhiteSpace(normalized))
                throw new ArgumentException("Email is required.", nameof(raw));

            // validate đơn giản
     
            var at = normalized.IndexOf('@');
            if (at <= 0 || at == normalized.Length - 1)
                throw new ArgumentException("Invalid email format.", nameof(raw));

            return new Email(normalized);
        }

        public static string Normalize(string? raw)
            => (raw ?? string.Empty).Trim().ToLowerInvariant();

        public override string ToString() => Value;

        public bool Equals(Email? other)
            => other is not null && string.Equals(Value, other.Value, StringComparison.Ordinal);

        public override bool Equals(object? obj) => Equals(obj as Email);

        public override int GetHashCode()
            => StringComparer.Ordinal.GetHashCode(Value);
    }
}
