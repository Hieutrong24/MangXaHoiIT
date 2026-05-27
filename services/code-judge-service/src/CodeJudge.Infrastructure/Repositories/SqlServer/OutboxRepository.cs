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
        var eventId = Guid.NewGuid();
        _db.OutboxEvents.Add(new OutboxEvent
        {
            EventId = eventId,
            AggregateId = req.AggregateId,
            EventType = req.EventType,
            PayloadJson = req.PayloadJson,
            OccurredAt = DateTime.UtcNow,
            TraceId = eventId.ToString("N")
        });
        return Task.CompletedTask;
    }
}
