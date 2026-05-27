using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_LearningPaths")]
public class LearningPath
{
    [Key] public Guid PathId { get; set; }
    public string Title { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public byte? LevelFrom { get; set; }
    public byte? LevelTo { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int TotalXpReward { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Icon { get; set; }
    public string? ColorHex { get; set; }
    public string UnlockRule { get; set; } = "prerequisite";
    public int MinimumXpRequired { get; set; }
    public decimal MinimumCompletionPercent { get; set; } = 100m;
    public byte Status { get; set; }
    public bool IsPublic { get; set; }
    public int SortOrder { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
