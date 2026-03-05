namespace auth_service.src.Auth.Application.Interfaces
{
    public interface IOutboxService
    {
        Task PublishAsync(Guid aggregateId, string eventType, object payload, string? traceId = null);
    }
}
