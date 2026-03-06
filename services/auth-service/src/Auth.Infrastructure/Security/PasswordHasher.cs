using System;
using System.Security.Cryptography;
using System.Text;
using auth_service.src.Auth.Application.Interfaces;

namespace auth_service.src.Auth.Infrastructure.Security
{
    public class PasswordHasher : IPasswordHasher
    {
       
        private const string DefaultAlgo = "BCRYPT";

        public (byte[] Hash, string Algo) Hash(string password, string? algo = null)
        {
            if (password is null) throw new ArgumentNullException(nameof(password));

            var selected = NormalizeAlgo(algo) ?? DefaultAlgo;

            return selected switch
            {
                "BCRYPT" => (HashBcrypt(password), "BCRYPT"),
                "SHA2_512" => (HashSha512(password), "SHA2_512"),
                _ => throw new NotSupportedException($"Unsupported password algo: {selected}")
            };
        }

        public bool Verify(string password, byte[] hash, string algo)
        {
            if (password is null) throw new ArgumentNullException(nameof(password));
            if (hash is null) throw new ArgumentNullException(nameof(hash));

            var selected = NormalizeAlgo(algo);
            if (selected is null) return false;

            return selected switch
            {
                "BCRYPT" => VerifyBcrypt(password, hash),
                "SHA2_512" => VerifySha512(password, hash),
                _ => false
            };
        }

        private static string? NormalizeAlgo(string? algo)
        {
            if (string.IsNullOrWhiteSpace(algo)) return null;

            var a = algo.Trim().ToUpperInvariant();

            return a switch
            {
                "BCRYPT" => "BCRYPT",
                "SHA512" => "SHA2_512",
                "SHA-512" => "SHA2_512",
                "SHA2_512" => "SHA2_512",
                _ => a
            };
        }

        
        private static byte[] HashSha512(string password)
            => SHA512.HashData(GetSqlServerUnicodeBytes(password));

        private static bool VerifySha512(string password, byte[] storedHash)
        {
            if (storedHash.Length != 64) return false;

            var computed = SHA512.HashData(GetSqlServerUnicodeBytes(password));
            return CryptographicOperations.FixedTimeEquals(computed, storedHash);
        }

        private static byte[] GetSqlServerUnicodeBytes(string s)
            => Encoding.Unicode.GetBytes(s); // UTF-16LE

      
        private static byte[] HashBcrypt(string password)
        {
            var bcryptHash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
            return Encoding.UTF8.GetBytes(bcryptHash);
        }

        private static bool VerifyBcrypt(string password, byte[] storedHashBytes)
        {
            if (storedHashBytes.Length == 0) return false;

            var bcryptHash = Encoding.UTF8.GetString(storedHashBytes).TrimEnd('\0').Trim();

            if (!(bcryptHash.StartsWith("$2a$") || bcryptHash.StartsWith("$2b$") || bcryptHash.StartsWith("$2y$")))
                return false;

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, bcryptHash);
            }
            catch
            {
                return false;
            }
        }
    }
}
