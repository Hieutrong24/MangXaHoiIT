using System.Text.Json;
using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Infrastructure.Persistence;

namespace auth_service.src.Auth.Infrastructure.Outbox
{
    public class OutboxService : IOutboxService
    {
        private readonly AuthDbContext _context;

        public OutboxService(AuthDbContext context)
        {
            _context = context;
        }

        public async Task PublishAsync(Guid aggregateId, string eventType, object payload, string? traceId = null)
        {
            var evt = new OutboxEvent
            {
                EventId = Guid.NewGuid(),
                AggregateId = aggregateId,
                EventType = eventType,
                PayloadJson = JsonSerializer.Serialize(payload),
                OccurredAt = DateTime.UtcNow,
                ProcessedAt = null,
                TraceId = traceId
            };

            _context.AuthOutboxEvents.Add(evt);
            await _context.SaveChangesAsync();
        }
    }
}
