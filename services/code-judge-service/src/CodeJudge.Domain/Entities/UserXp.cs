using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_UserXP")]
public class UserXp
{
    [Key] public Guid UserXpId { get; set; }
    public Guid UserId { get; set; }
    public string SourceType { get; set; } = default!;
    public Guid? SourceId { get; set; }
    public int XpDelta { get; set; }
    public string? Reason { get; set; }
    public int? BalanceAfter { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? MetadataJson { get; set; }
}
