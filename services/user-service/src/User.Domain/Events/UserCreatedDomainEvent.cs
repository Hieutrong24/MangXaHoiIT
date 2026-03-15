namespace User.Domain.Events;

public sealed record UserCreatedDomainEvent(Guid UserId, string StudentCode, string Username) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
