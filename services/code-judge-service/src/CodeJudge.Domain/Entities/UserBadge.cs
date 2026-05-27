using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_UserBadges")]
public class UserBadge
{
    [Key] public Guid UserBadgeId { get; set; }
    public Guid UserId { get; set; }
    public Guid BadgeId { get; set; }
    public DateTime AwardedAt { get; set; }
    public Guid? AwardedByRuleId { get; set; }
    public string? Note { get; set; }
    public string? MetadataJson { get; set; }
}
