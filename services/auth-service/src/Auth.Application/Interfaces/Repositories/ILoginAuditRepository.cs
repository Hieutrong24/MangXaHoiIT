using auth_service.src.Auth.Domain.Entities;

namespace auth_service.src.Auth.Application.Interfaces.Repositories
{
    public interface ILoginAuditRepository
    {
        Task LogAsync(LoginAuditLog log);
        Task<IReadOnlyList<LoginAuditLog>> ListAsync(Guid? userId = null, string? email = null, bool? success = null, int limit = 100);
    }
}
