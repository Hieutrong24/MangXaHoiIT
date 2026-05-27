using System.Text.Json;
using User.Application.Interfaces;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Outbox;

public sealed class IntegrationEventWriter : IIntegrationEventWriter
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly UserDbContext _db;

    public IntegrationEventWriter(UserDbContext db)
    {
        _db = db;
    }

    public async Task WriteAsync(
        Guid aggregateId,
        string eventType,
        object payload,
        string? traceId = null,
        CancellationToken ct = default)
    {
        var evt = new UserOutboxEvent
        {
            EventId = Guid.NewGuid(),
            AggregateId = aggregateId,
            EventType = eventType,
            PayloadJson = JsonSerializer.Serialize(payload, payload.GetType(), JsonOptions),
            OccurredAt = DateTime.UtcNow,
            ProcessedAt = null,
            TraceId = traceId
        };

        _db.UserOutboxEvents.Add(evt);
        await Task.CompletedTask;
    }
}