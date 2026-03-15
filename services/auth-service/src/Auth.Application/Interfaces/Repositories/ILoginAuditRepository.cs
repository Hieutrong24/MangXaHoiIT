using auth_service.src.Auth.Domain.Entities;

namespace auth_service.src.Auth.Application.Interfaces.Repositories
{
    public interface ILoginAuditRepository
    {
        Task LogAsync(LoginAuditLog log);
    }
}
