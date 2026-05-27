using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_LessonItems")]
public class LessonItem
{
    [Key] public Guid LessonItemId { get; set; }
    public Guid LessonId { get; set; }
    public string ItemType { get; set; } = default!;
    public Guid? RefId { get; set; }
    public string? Title { get; set; }
    public string? ContentMarkdown { get; set; }
    public int? EstimatedMinutes { get; set; }
    public bool IsRequired { get; set; }
    public Guid? UnlockAfterLessonItemId { get; set; }
    public int SortOrder { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; }
}
