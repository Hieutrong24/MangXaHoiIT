namespace User.Domain.Events;

public interface IDomainEvent
{
    DateTime OccurredAt { get; }
}
