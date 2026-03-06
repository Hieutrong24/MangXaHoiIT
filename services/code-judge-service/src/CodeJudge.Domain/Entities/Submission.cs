using CodeJudge.Domain.Enums;

namespace CodeJudge.Domain.Entities;

public class Submission
{
    public Guid SubmissionId { get; set; }
    public Guid ProblemId { get; set; }
    public Problem? Problem { get; set; }

    public Guid UserId { get; set; }
    public int LanguageId { get; set; }
    public Language? Language { get; set; }

    public string SourceCode { get; set; } = default!;
    public byte[] CodeHash { get; set; } = default!; 
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public SubmissionStatus Status { get; set; } = SubmissionStatus.Queued;

    public int? TotalTimeMs { get; set; }
    public int? TotalMemoryKB { get; set; }
    public int? Score { get; set; }
    public string? CompilerMessage { get; set; }

    public ICollection<JudgeResult> TestResults { get; set; } = new List<JudgeResult>();
}
