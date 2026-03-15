using User.Domain.Entities;

namespace User.Application.Interfaces.Repositories;

public interface IUserSettingsRepository
{
    Task<UserSettings?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
}
