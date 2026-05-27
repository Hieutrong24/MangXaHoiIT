using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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

        public async Task<IReadOnlyList<LoginAuditLog>> ListAsync(Guid? userId = null, string? email = null, bool? success = null, int limit = 100)
        {
            var query = _context.AuthLoginAuditLogs.AsNoTracking().AsQueryable();
            if (userId.HasValue) query = query.Where(x => x.UserId == userId.Value);
            if (!string.IsNullOrWhiteSpace(email))
            {
                var normalized = email.Trim().ToLowerInvariant();
                query = query.Where(x => x.Email.ToLower().Contains(normalized));
            }
            if (success.HasValue) query = query.Where(x => x.Success == success.Value);
            var safeLimit = Math.Clamp(limit, 1, 500);
            return await query.OrderByDescending(x => x.CreatedAt).Take(safeLimit).ToListAsync();
        }
    }
}
