using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Domain.Enums;
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
            return await _context.AuthAccounts.FirstOrDefaultAsync(x => x.Email.Value.ToLower() == normalized);
        }

        public Task<AuthAccount?> GetByIdAsync(Guid userId)
            => _context.AuthAccounts.FirstOrDefaultAsync(x => x.UserId == userId);

        public async Task<IReadOnlyList<AuthAccount>> ListAsync(string? keyword = null, AccountStatus? status = null)
        {
            var query = _context.AuthAccounts.AsQueryable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalized = NormalizeEmail(keyword);
                query = query.Where(x => x.Email.Value.ToLower().Contains(normalized) || x.UserId.ToString() == keyword);
            }
            if (status.HasValue)
            {
                query = query.Where(x => x.Status == status.Value);
            }
            return await query.OrderByDescending(x => x.CreatedAt).ToListAsync();
        }

        public async Task AddAsync(AuthAccount account)
        {
            _context.AuthAccounts.Add(account);
            await _context.SaveChangesAsync();
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
