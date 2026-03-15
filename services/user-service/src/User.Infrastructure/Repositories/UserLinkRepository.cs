using Microsoft.EntityFrameworkCore;
using User.Application.Interfaces.Repositories;
using User.Domain.Entities;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Repositories;

public sealed class UserLinkRepository : IUserLinkRepository
{
    private readonly UserDbContext _db;
    public UserLinkRepository(UserDbContext db) => _db = db;

    public async Task<IReadOnlyList<UserLink>> ListByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _db.UserLinks.Where(x => x.UserId == userId).OrderByDescending(x => x.CreatedAt).ToListAsync(ct);

    public Task<UserLink?> GetByIdAsync(Guid linkId, CancellationToken ct = default)
        => _db.UserLinks.FirstOrDefaultAsync(x => x.LinkId == linkId, ct);
}
