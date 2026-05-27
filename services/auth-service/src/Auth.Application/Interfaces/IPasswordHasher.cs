namespace auth_service.src.Auth.Application.Interfaces
{
    public interface IPasswordHasher
    {
        (byte[] Hash, string Algo) Hash(string password, string? algo = null);
        bool Verify(string password, byte[] hash, string algo);
    }
}
