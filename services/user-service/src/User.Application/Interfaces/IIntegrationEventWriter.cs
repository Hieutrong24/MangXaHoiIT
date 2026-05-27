namespace User.Application.Interfaces;

public interface IIntegrationEventWriter
{
    Task WriteAsync(
        Guid aggregateId,
        string eventType,
        object payload,
        string? traceId = null,
        CancellationToken ct = default);
}