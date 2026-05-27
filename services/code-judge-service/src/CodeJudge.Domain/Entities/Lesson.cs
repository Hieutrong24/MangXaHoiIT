using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_Lessons")]
public class Lesson
{
    [Key] public Guid LessonId { get; set; }
    public Guid PathId { get; set; }
    public Guid? TopicId { get; set; }
    public string Title { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Summary { get; set; }
    public string? ContentMarkdown { get; set; }
    public string LessonType { get; set; } = "mixed";
    public byte? DifficultyLevel { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int PointsReward { get; set; }
    public int XpReward { get; set; }
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? VisibleFrom { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
