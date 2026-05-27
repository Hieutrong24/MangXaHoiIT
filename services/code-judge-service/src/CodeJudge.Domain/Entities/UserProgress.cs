using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_UserProgress")]
public class UserProgress
{
    [Key] public Guid UserProgressId { get; set; }
    public Guid UserId { get; set; }
    public string ProgressType { get; set; } = default!;
    public Guid EntityId { get; set; }
    public string Status { get; set; } = "not_started";
    public decimal CompletionPercent { get; set; }
    public int CurrentStep { get; set; }
    public int TotalSteps { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
