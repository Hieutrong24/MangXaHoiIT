using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_PathPrerequisites")]
public class PathPrerequisite
{
    [Key] public Guid PathPrerequisiteId { get; set; }
    public Guid PathId { get; set; }
    public Guid RequiredPathId { get; set; }
    public string RequirementType { get; set; } = "complete_path";
    public decimal MinCompletionPercent { get; set; } = 100m;
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
