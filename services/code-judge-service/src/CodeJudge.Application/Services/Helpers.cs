using System.Security.Cryptography;
using System.Text;

namespace CodeJudge.Application.Services;

public static class Helpers
{
    public static byte[] Sha256(string text)
    {
        var bytes = Encoding.UTF8.GetBytes(text);
        return SHA256.HashData(bytes);
    }

    public static byte[] ToBytesUtf8(string s) => Encoding.UTF8.GetBytes(s ?? "");
    public static string FromBytesUtf8(byte[] b) => Encoding.UTF8.GetString(b ?? Array.Empty<byte>());
}
