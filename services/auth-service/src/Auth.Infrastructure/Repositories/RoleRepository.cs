using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace auth_service.src.Auth.Infrastructure.Repositories
{
    public sealed class RoleRepository : IRoleRepository
    {
        private readonly AuthDbContext _context;
        public RoleRepository(AuthDbContext context) => _context = context;

        public async Task<IReadOnlyList<AuthRole>> ListAsync()
            => await _context.AuthRoles.AsNoTracking().OrderBy(x => x.RoleId).ToListAsync();

        public Task<AuthRole?> GetByNameAsync(string roleName)
            => _context.AuthRoles.AsNoTracking().FirstOrDefaultAsync(x => x.Name == roleName);
    }
}
