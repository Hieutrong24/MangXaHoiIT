using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_UserChallengeProgress")]
public class UserChallengeProgress
{
    [Key] public Guid UserChallengeProgressId { get; set; }
    public Guid UserId { get; set; }
    public Guid ChallengeId { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal TargetValue { get; set; }
    public string Status { get; set; } = "in_progress";
    public DateTime? CompletedAt { get; set; }
    public DateTime? RewardClaimedAt { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
