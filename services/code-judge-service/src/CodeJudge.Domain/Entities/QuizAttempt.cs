using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_QuizAttempts")]
public class QuizAttempt
{
    [Key] public Guid QuizAttemptId { get; set; }
    public Guid QuizId { get; set; }
    public Guid UserId { get; set; }
    public int AttemptNo { get; set; }
    public string Status { get; set; } = "in_progress";
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public int? TimeSpentSeconds { get; set; }
    public int CorrectCount { get; set; }
    public int WrongCount { get; set; }
    public int UnansweredCount { get; set; }
    public decimal Score { get; set; }
    public decimal? Percentage { get; set; }
    public bool IsPassed { get; set; }
    public int EarnedXp { get; set; }
    public string? MetadataJson { get; set; }
}
