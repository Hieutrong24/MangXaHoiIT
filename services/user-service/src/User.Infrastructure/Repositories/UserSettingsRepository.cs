using Microsoft.EntityFrameworkCore;
using User.Application.Interfaces.Repositories;
using User.Domain.Entities;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Repositories;

public sealed class UserSettingsRepository : IUserSettingsRepository
{
    private readonly UserDbContext _db;
    public UserSettingsRepository(UserDbContext db) => _db = db;

    public Task<UserSettings?> GetByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == userId, ct);
}
