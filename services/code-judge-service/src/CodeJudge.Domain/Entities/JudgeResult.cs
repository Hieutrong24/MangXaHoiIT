namespace CodeJudge.Domain.Entities;

public class JudgeResult
{
    public Guid SubmissionTestResultId { get; set; }
    public Guid SubmissionId { get; set; }
    public Submission? Submission { get; set; }
    public Guid TestCaseId { get; set; }
    public TestCase? TestCase { get; set; }
    public byte Status { get; set; }
    public int TimeMs { get; set; }
    public int MemoryKB { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ActualOutput { get; set; }
    public string? ExpectedOutput { get; set; }
    public decimal? ScoreEarned { get; set; }
    public string? DiffText { get; set; }
    public string? CheckerNote { get; set; }
    public bool? IsSampleCase { get; set; }
    public int? CaseOrderNo { get; set; }
    public string? ExecutionToken { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
