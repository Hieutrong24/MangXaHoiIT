using Microsoft.EntityFrameworkCore;
using User.Application.Interfaces.Repositories;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Repositories;

public sealed class OutboxRepository : IOutboxRepository
{
    private readonly UserDbContext _db;
    public OutboxRepository(UserDbContext db) => _db = db;

    public async Task<IReadOnlyList<UserOutboxEventRow>> GetUnprocessedAsync(int take, CancellationToken ct = default)
    {
        var rows = await _db.UserOutboxEvents
            .Where(x => x.ProcessedAt == null)
            .OrderBy(x => x.OccurredAt)
            .Take(take)
            .Select(x => new UserOutboxEventRow(
                x.EventId, x.AggregateId, x.EventType, x.PayloadJson, x.OccurredAt, x.ProcessedAt, x.TraceId))
            .ToListAsync(ct);

        return rows;
    }

    public async Task MarkProcessedAsync(Guid eventId, CancellationToken ct = default)
    {
        var entity = await _db.UserOutboxEvents.FirstOrDefaultAsync(x => x.EventId == eventId, ct);
        if (entity is null) return;
        entity.ProcessedAt = DateTime.UtcNow;
    }
}
