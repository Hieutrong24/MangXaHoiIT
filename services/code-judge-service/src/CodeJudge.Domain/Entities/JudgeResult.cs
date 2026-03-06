namespace CodeJudge.Domain.Entities;

// Map báº£ng Judge_SubmissionTestResults
public class JudgeResult
{
    public long Id { get; set; } // identity
    public Guid SubmissionId { get; set; }
    public Submission? Submission { get; set; }

    public Guid TestCaseId { get; set; }
    public TestCase? TestCase { get; set; }

    public byte Status { get; set; }
    public int TimeMs { get; set; }
    public int MemoryKB { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
