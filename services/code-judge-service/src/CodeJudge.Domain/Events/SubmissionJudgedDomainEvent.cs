namespace CodeJudge.Domain.Events;

public record SubmissionJudgedDomainEvent(Guid SubmissionId, string Verdict, int? TotalTimeMs, int? TotalMemoryKB, int? Score);
