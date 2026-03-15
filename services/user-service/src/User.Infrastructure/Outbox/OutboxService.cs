using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using User.Domain.Events;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Outbox;

public sealed class OutboxService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public void AddDomainEventsToOutbox(UserDbContext db, string? traceId = null)
    {
        var entities = db.ChangeTracker.Entries()
            .Where(e => e.Entity is IHasDomainEvents)
            .Select(e => (IHasDomainEvents)e.Entity)
            .ToList();

        foreach (var entity in entities)
        {
            foreach (var evt in entity.DomainEvents)
            {
                // best-effort: infer aggregate id if possible
                var aggregateId = TryGetAggregateId(entity);

                db.UserOutboxEvents.Add(new UserOutboxEvent
                {
                    EventId = Guid.NewGuid(),
                    AggregateId = aggregateId,
                    EventType = evt.GetType().Name,
                    PayloadJson = JsonSerializer.Serialize(evt, evt.GetType(), JsonOptions),
                    OccurredAt = evt.OccurredAt,
                    TraceId = traceId
                });
            }

            entity.ClearDomainEvents();
        }
    }

    private static Guid TryGetAggregateId(IHasDomainEvents entity)
    {
        var prop = entity.GetType().GetProperty("UserId");
        if (prop?.PropertyType == typeof(Guid))
        {
            var val = prop.GetValue(entity);
            if (val is Guid g) return g;
        }
        return Guid.Empty;
    }
}
