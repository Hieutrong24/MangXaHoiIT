using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_Badges")]
public class Badge
{
    [Key] public Guid BadgeId { get; set; }
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public string? ColorHex { get; set; }
    public string? Category { get; set; }
    public string? Rarity { get; set; }
    public int PointsReward { get; set; }
    public int XpReward { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
