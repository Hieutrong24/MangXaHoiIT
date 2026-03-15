using System;

namespace auth_service.src.Auth.Infrastructure.Persistence
{
    public class OutboxEvent
    {
        public Guid EventId { get; set; }
        public Guid AggregateId { get; set; }

        public string EventType { get; set; } = string.Empty;
        public string PayloadJson { get; set; } = string.Empty;

        public DateTime OccurredAt { get; set; }
        public DateTime? ProcessedAt { get; set; }

        public string? TraceId { get; set; }
    }
}
