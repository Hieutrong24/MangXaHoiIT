using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class OutboxRepository : IOutboxRepository
{
    private readonly JudgeDbContext _db;
    public OutboxRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(OutboxCreate req, CancellationToken ct = default)
    {
        _db.OutboxEvents.Add(new OutboxEvent
        {
            EventId = Guid.NewGuid(),
            AggregateId = req.AggregateId,
            EventType = req.EventType,
            PayloadJson = req.PayloadJson,
            OccurredAt = DateTime.UtcNow
        });
        return Task.CompletedTask;
    }
}
