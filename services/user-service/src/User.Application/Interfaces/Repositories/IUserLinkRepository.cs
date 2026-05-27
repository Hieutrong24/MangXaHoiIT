using User.Domain.Entities;

namespace User.Application.Interfaces.Repositories;

public interface IUserLinkRepository
{
    Task<IReadOnlyList<UserLink>> ListByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<UserLink?> GetByIdAsync(Guid linkId, CancellationToken ct = default);
}
