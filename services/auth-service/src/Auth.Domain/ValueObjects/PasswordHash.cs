using System;

namespace auth_service.src.Auth.Domain.ValueObjects
{
    public sealed class PasswordHash : IEquatable<PasswordHash>
    {
        public byte[] Hash { get; private set; } = default!;
        public string Algorithm { get; private set; } = default!;

        // EF Core
        private PasswordHash() { }

        private PasswordHash(byte[] hash, string algorithm)
        {
            Hash = hash;
            Algorithm = algorithm;
        }

        public static PasswordHash Create(byte[] hash, string algorithm)
        {
            if (hash is null || hash.Length == 0)
                throw new ArgumentException("Password hash is required.", nameof(hash));

            if (string.IsNullOrWhiteSpace(algorithm))
                throw new ArgumentException("Password algorithm is required.", nameof(algorithm));

            var algo = NormalizeAlgo(algorithm);

            
            if (hash.Length > 256)
                throw new ArgumentException("Password hash is too long for VARBINARY(256).", nameof(hash));

            return new PasswordHash(hash, algo);
        }

        public static string NormalizeAlgo(string algo)
            => algo.Trim().ToUpperInvariant();

        public bool Equals(PasswordHash? other)
        {
            if (other is null) return false;
            if (!string.Equals(Algorithm, other.Algorithm, StringComparison.Ordinal)) return false;
            if (Hash.Length != other.Hash.Length) return false;

            for (int i = 0; i < Hash.Length; i++)
                if (Hash[i] != other.Hash[i]) return false;

            return true;
        }

        public override bool Equals(object? obj) => Equals(obj as PasswordHash);

        public override int GetHashCode()
        {
            
            unchecked
            {
                int hc = StringComparer.Ordinal.GetHashCode(Algorithm);
                hc = (hc * 31) ^ Hash.Length;
                if (Hash.Length > 0) hc = (hc * 31) ^ Hash[0];
                if (Hash.Length > 1) hc = (hc * 31) ^ Hash[^1];
                return hc;
            }
        }
    }
}
