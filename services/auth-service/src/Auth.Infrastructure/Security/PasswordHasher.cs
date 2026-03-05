using System;
using System.Security.Cryptography;
using System.Text;
using auth_service.src.Auth.Application.Interfaces;

namespace auth_service.src.Auth.Infrastructure.Security
{
    public class PasswordHasher : IPasswordHasher
    {
        // Nếu DB hiện tại đang seed theo SHA2_512 thì bạn có thể đổi DefaultAlgo = "SHA2_512"
        // Còn nếu tạo mới thì BCRYPT an toàn hơn.
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

        // ===================== SHA2_512 (64 bytes) =====================
        // IMPORTANT:
        // SQL Server khi bạn dùng:
        //   HASHBYTES('SHA2_512', CONVERT(varbinary(max), N'password'))
        // thì N'...' là NVARCHAR => bytes là UTF-16LE => tương ứng Encoding.Unicode trong .NET
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

        // ===================== BCRYPT (string ~60 chars) =====================
        // Lưu bcrypt hash dưới dạng UTF8 bytes vào VARBINARY(256)
        private static byte[] HashBcrypt(string password)
        {
            var bcryptHash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
            return Encoding.UTF8.GetBytes(bcryptHash);
        }

        private static bool VerifyBcrypt(string password, byte[] storedHashBytes)
        {
            if (storedHashBytes.Length == 0) return false;

            // VARBINARY(256) có thể có trailing 0x00 -> trim
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
