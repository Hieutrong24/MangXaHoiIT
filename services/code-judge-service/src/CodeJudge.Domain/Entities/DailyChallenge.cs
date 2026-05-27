using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_DailyChallenges")]
public class DailyChallenge
{
    [Key] public Guid ChallengeId { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string ChallengeType { get; set; } = default!;
    public string TargetMetric { get; set; } = default!;
    public decimal TargetValue { get; set; }
    public Guid? TopicId { get; set; }
    public Guid? SkillTagId { get; set; }
    public Guid? ProblemId { get; set; }
    public Guid? QuizId { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public int XpReward { get; set; }
    public int PointsReward { get; set; }
    public Guid? BadgeId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
