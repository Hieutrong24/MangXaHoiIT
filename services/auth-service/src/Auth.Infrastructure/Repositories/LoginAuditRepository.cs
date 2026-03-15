using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Infrastructure.Persistence;

namespace auth_service.src.Auth.Infrastructure.Repositories
{
    public class LoginAuditRepository : ILoginAuditRepository
    {
        private readonly AuthDbContext _context;

        public LoginAuditRepository(AuthDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(LoginAuditLog log)
        {
            _context.AuthLoginAuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
