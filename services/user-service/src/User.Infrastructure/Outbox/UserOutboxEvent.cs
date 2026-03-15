namespace User.Infrastructure.Outbox;

public sealed class UserOutboxEvent
{
    public Guid EventId { get; set; }
    public Guid AggregateId { get; set; }
    public string EventType { get; set; } = default!;
    public string PayloadJson { get; set; } = default!;
    public DateTime OccurredAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? TraceId { get; set; }
}
