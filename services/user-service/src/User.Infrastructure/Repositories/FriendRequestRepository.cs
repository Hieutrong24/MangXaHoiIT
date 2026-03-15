using Microsoft.EntityFrameworkCore;
using User.Application.Interfaces.Repositories;
using User.Domain.Entities;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Repositories;

public sealed class FriendRequestRepository : IFriendRequestRepository
{
    private readonly UserDbContext _db;
    public FriendRequestRepository(UserDbContext db) => _db = db;

    public Task<FriendRequest?> GetByIdAsync(Guid requestId, CancellationToken ct = default) =>
        _db.FriendRequests.FirstOrDefaultAsync(x => x.RequestId == requestId, ct);

    public Task<FriendRequest?> GetActiveAsync(Guid fromUserId, Guid toUserId, CancellationToken ct = default) =>
        _db.FriendRequests.FirstOrDefaultAsync(x => x.FromUserId == fromUserId && x.ToUserId == toUserId && x.IsActive, ct);

    public Task AddAsync(FriendRequest fr, CancellationToken ct = default) =>
        _db.FriendRequests.AddAsync(fr, ct).AsTask();

    public async Task<(List<FriendRequest> Items, long Total)> ListIncomingAsync(
    Guid actorUserId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _db.FriendRequests
            .Where(x => x.ToUserId == actorUserId && x.IsActive)
            .OrderByDescending(x => x.CreatedAt);

        var total = await query.LongCountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<(List<FriendRequest> Items, long Total)> ListOutgoingAsync(
        Guid actorUserId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _db.FriendRequests
            .Where(x => x.FromUserId == actorUserId && x.IsActive)
            .OrderByDescending(x => x.CreatedAt);

        var total = await query.LongCountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }
}
