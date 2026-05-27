using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_UserPathStates")]
public class UserPathState
{
    [Key] public Guid UserPathStateId { get; set; }
    public Guid UserId { get; set; }
    public Guid PathId { get; set; }
    public string Status { get; set; } = "locked";
    public bool IsUnlocked { get; set; }
    public DateTime? UnlockedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public decimal CompletionPercent { get; set; }
    public int LessonsCompletedCount { get; set; }
    public int TotalLessonsCount { get; set; }
    public Guid? CurrentLessonId { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
