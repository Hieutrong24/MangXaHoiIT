using Microsoft.EntityFrameworkCore;
using User.Application.Interfaces.Repositories;
using User.Domain.Entities;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Repositories;

public sealed class BlockRepository : IBlockRepository
{
    private readonly UserDbContext _db;
    public BlockRepository(UserDbContext db) => _db = db;

    public Task<bool> ExistsAsync(Guid blockerId, Guid blockedId, CancellationToken ct = default) =>
        _db.Blocks.AnyAsync(x => x.BlockerId == blockerId && x.BlockedId == blockedId, ct);

    public async Task AddAsync(Guid blockerId, Guid blockedId, CancellationToken ct = default) =>
        await _db.Blocks.AddAsync(new Block(blockerId, blockedId), ct);

    public async Task RemoveAsync(Guid blockerId, Guid blockedId, CancellationToken ct = default)
    {
        var entity = await _db.Blocks.FirstOrDefaultAsync(x => x.BlockerId == blockerId && x.BlockedId == blockedId, ct);
        if (entity is null) return;
        _db.Blocks.Remove(entity);
    }

    public Task<bool> IsBlockedBetweenAsync(Guid a, Guid b, CancellationToken ct = default) =>
        _db.Blocks.AnyAsync(x => (x.BlockerId == a && x.BlockedId == b) || (x.BlockerId == b && x.BlockedId == a), ct);
}
