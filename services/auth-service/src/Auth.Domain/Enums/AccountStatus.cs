namespace auth_service.src.Auth.Domain.Enums
{
    // Khớp DB: 1=Active, 2=Locked, 3=Deleted
    public enum AccountStatus : byte
    {
        Active = 1,
        Locked = 2,
        Deleted = 3
    }
}
