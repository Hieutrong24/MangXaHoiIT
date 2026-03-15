namespace User.Application.Interfaces.Repositories;

public interface IOutboxRepository
{
    Task<IReadOnlyList<UserOutboxEventRow>> GetUnprocessedAsync(int take, CancellationToken ct = default);
    Task MarkProcessedAsync(Guid eventId, CancellationToken ct = default);
}

public sealed record UserOutboxEventRow(
    Guid EventId,
    Guid AggregateId,
    string EventType,
    string PayloadJson,
    DateTime OccurredAt,
    DateTime? ProcessedAt,
    string? TraceId
);
