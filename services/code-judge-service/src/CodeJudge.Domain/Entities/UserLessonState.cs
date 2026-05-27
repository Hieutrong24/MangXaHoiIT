using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_UserLessonStates")]
public class UserLessonState
{
    [Key] public Guid UserLessonStateId { get; set; }
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public string Status { get; set; } = "not_started";
    public decimal CompletionPercent { get; set; }
    public Guid? CurrentLessonItemId { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? LastViewedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
