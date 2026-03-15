using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace auth_service.src.Auth.Infrastructure.Repositories
{
    public class AuthAccountRepository : IAuthAccountRepository
    {
        private readonly AuthDbContext _context;

        public AuthAccountRepository(AuthDbContext context)
        {
            _context = context;
        }

        public async Task<AuthAccount?> GetByEmailAsync(string email)
        {
            var normalized = NormalizeEmail(email);

            
            return await _context.AuthAccounts
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Email.Value.ToLower() == normalized);
        }

        public async Task<AuthAccount?> GetByIdAsync(Guid userId)
        {
            return await _context.AuthAccounts
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId);
        }

        public async Task UpdateAsync(AuthAccount account)
        {
            _context.AuthAccounts.Update(account);
            await _context.SaveChangesAsync();
        }

        private static string NormalizeEmail(string? email)
            => (email ?? string.Empty).Trim().ToLowerInvariant();
    }
}
