namespace User.Application.Interfaces.Repositories;

public interface IBlockRepository
{
    Task<bool> ExistsAsync(Guid blockerId, Guid blockedId, CancellationToken ct = default);
    Task AddAsync(Guid blockerId, Guid blockedId, CancellationToken ct = default);
    Task RemoveAsync(Guid blockerId, Guid blockedId, CancellationToken ct = default);

 
    Task<bool> IsBlockedBetweenAsync(Guid a, Guid b, CancellationToken ct = default);
}
