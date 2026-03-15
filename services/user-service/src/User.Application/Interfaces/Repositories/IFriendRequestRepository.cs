using User.Domain.Entities;

namespace User.Application.Interfaces.Repositories;

public interface IFriendRequestRepository
{
    Task<FriendRequest?> GetByIdAsync(Guid requestId, CancellationToken ct = default);
    Task<FriendRequest?> GetActiveAsync(Guid fromUserId, Guid toUserId, CancellationToken ct = default);
    Task AddAsync(FriendRequest fr, CancellationToken ct = default);
    Task<(List<FriendRequest> Items, long Total)> ListIncomingAsync(
    Guid actorUserId, int page, int pageSize, CancellationToken ct);

    Task<(List<FriendRequest> Items, long Total)> ListOutgoingAsync(
        Guid actorUserId, int page, int pageSize, CancellationToken ct);
}
