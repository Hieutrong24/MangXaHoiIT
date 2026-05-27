using Microsoft.EntityFrameworkCore;
using User.Application.Interfaces.Repositories;
using User.Domain.Entities;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Repositories;

public sealed class FollowRepository : IFollowRepository
{
    private readonly UserDbContext _db;
    public FollowRepository(UserDbContext db) => _db = db;

    public Task<bool> ExistsAsync(Guid followerId, Guid followeeId, CancellationToken ct = default) =>
        _db.Follows.AsNoTracking()
            .AnyAsync(x => x.FollowerId == followerId && x.FolloweeId == followeeId, ct);

    public async Task AddAsync(Guid followerId, Guid followeeId, CancellationToken ct = default)
    {
 
        var exists = await _db.Follows.AsNoTracking()
            .AnyAsync(x => x.FollowerId == followerId && x.FolloweeId == followeeId, ct);

        if (exists) return;

        await _db.Follows.AddAsync(new Follow(followerId, followeeId), ct);
    }

    public async Task RemoveAsync(Guid followerId, Guid followeeId, CancellationToken ct = default)
    {
        var entity = await _db.Follows
            .FirstOrDefaultAsync(x => x.FollowerId == followerId && x.FolloweeId == followeeId, ct);

        if (entity is null) return;

        _db.Follows.Remove(entity);
    }

    public Task<int> CountFollowersAsync(Guid userId, CancellationToken ct = default) =>
        _db.Follows.AsNoTracking()
            .CountAsync(x => x.FolloweeId == userId, ct);

    public Task<int> CountFollowingAsync(Guid userId, CancellationToken ct = default) =>
        _db.Follows.AsNoTracking()
            .CountAsync(x => x.FollowerId == userId, ct);

    // ? NEW: ph?c v? logic "friend = mutual follow"
    public Task<List<Guid>> ListFollowingIdsAsync(Guid userId, CancellationToken ct = default) =>
        _db.Follows.AsNoTracking()
            .Where(x => x.FollowerId == userId)
            .Select(x => x.FolloweeId)
            .Distinct()
            .ToListAsync(ct);

    public Task<List<Guid>> ListFollowerIdsAsync(Guid userId, CancellationToken ct = default) =>
        _db.Follows.AsNoTracking()
            .Where(x => x.FolloweeId == userId)
            .Select(x => x.FollowerId)
            .Distinct()
            .ToListAsync(ct);
}