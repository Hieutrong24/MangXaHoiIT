using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface IOutboxRepository
{
    Task AddAsync(OutboxCreate req, CancellationToken ct = default);
}

public sealed record OutboxCreate(Guid AggregateId, string EventType, string PayloadJson);
