using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace auth_service.src.Auth.Infrastructure.Repositories
{
    public class UserRoleRepository
    {
        private readonly AuthDbContext _context;

        public UserRoleRepository(AuthDbContext context)
        {
            _context = context;
        }

        public Task<bool> HasRoleAsync(Guid userId, int roleId)
        {
            return _context.AuthUserRoles.AnyAsync(x => x.UserId == userId && x.RoleId == roleId);
        }

        public async Task AssignAsync(AuthUserRole ur)
        {
            _context.AuthUserRoles.Add(ur);
            await _context.SaveChangesAsync();
        }
    }
}
