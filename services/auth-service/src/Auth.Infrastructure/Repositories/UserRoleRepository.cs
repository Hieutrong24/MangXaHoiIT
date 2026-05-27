using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace auth_service.src.Auth.Infrastructure.Repositories
{
    public class UserRoleRepository : IUserRoleRepository
    {
        private readonly AuthDbContext _context;

        public UserRoleRepository(AuthDbContext context)
        {
            _context = context;
        }

        public Task<bool> HasRoleAsync(Guid userId, int roleId)
            => _context.AuthUserRoles.AnyAsync(x => x.UserId == userId && x.RoleId == roleId);

        public async Task<IReadOnlyList<string>> ListRoleNamesByUserIdAsync(Guid userId)
            => await _context.AuthUserRoles.AsNoTracking()
                .Join(_context.AuthRoles.AsNoTracking(), ur => ur.RoleId, r => r.RoleId, (ur, r) => new { ur.UserId, r.Name })
                .Where(x => x.UserId == userId)
                .OrderBy(x => x.Name)
                .Select(x => x.Name)
                .ToListAsync();

        public async Task<Dictionary<Guid, IReadOnlyList<string>>> ListRoleNamesByUserIdsAsync(IEnumerable<Guid> userIds)
        {
            var ids = userIds.Distinct().ToList();
            var rows = await _context.AuthUserRoles.AsNoTracking()
                .Join(_context.AuthRoles.AsNoTracking(), ur => ur.RoleId, r => r.RoleId, (ur, r) => new { ur.UserId, r.Name })
                .Where(x => ids.Contains(x.UserId))
                .ToListAsync();
            return rows.GroupBy(x => x.UserId).ToDictionary(g => g.Key, g => (IReadOnlyList<string>)g.Select(x => x.Name).OrderBy(x => x).ToList());
        }

        public async Task AssignAsync(AuthUserRole ur)
        {
            _context.AuthUserRoles.Add(ur);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> AssignRoleByNameAsync(Guid userId, string roleName)
        {
            var role = await _context.AuthRoles.FirstOrDefaultAsync(x => x.Name == roleName);
            if (role is null) return false;
            var exists = await _context.AuthUserRoles.AnyAsync(x => x.UserId == userId && x.RoleId == role.RoleId);
            if (exists) return true;
            _context.AuthUserRoles.Add(AuthUserRole.Assign(userId, role.RoleId));
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveRoleByNameAsync(Guid userId, string roleName)
        {
            var role = await _context.AuthRoles.FirstOrDefaultAsync(x => x.Name == roleName);
            if (role is null) return false;
            var row = await _context.AuthUserRoles.FirstOrDefaultAsync(x => x.UserId == userId && x.RoleId == role.RoleId);
            if (row is null) return false;
            _context.AuthUserRoles.Remove(row);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
