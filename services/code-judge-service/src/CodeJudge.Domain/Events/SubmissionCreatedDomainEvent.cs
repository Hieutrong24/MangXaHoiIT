namespace CodeJudge.Domain.Events;

public record SubmissionCreatedDomainEvent(Guid SubmissionId, Guid ProblemId, Guid UserId);
