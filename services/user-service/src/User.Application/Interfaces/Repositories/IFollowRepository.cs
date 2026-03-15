namespace User.Application.Interfaces.Repositories;

public interface IFollowRepository
{
    Task<bool> ExistsAsync(Guid followerId, Guid followeeId, CancellationToken ct = default);
    Task AddAsync(Guid followerId, Guid followeeId, CancellationToken ct = default);
    Task RemoveAsync(Guid followerId, Guid followeeId, CancellationToken ct = default);

    Task<int> CountFollowersAsync(Guid userId, CancellationToken ct = default);
    Task<int> CountFollowingAsync(Guid userId, CancellationToken ct = default);

    
    Task<List<Guid>> ListFollowingIdsAsync(Guid userId, CancellationToken ct = default);
    Task<List<Guid>> ListFollowerIdsAsync(Guid userId, CancellationToken ct = default);
}