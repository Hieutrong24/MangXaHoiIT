using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_QuizQuestions")]
public class QuizQuestion
{
    [Key] public Guid QuestionId { get; set; }
    public Guid QuizId { get; set; }
    public Guid? TopicId { get; set; }
    public Guid? SkillTagId { get; set; }
    public string QuestionType { get; set; } = "single_choice";
    public string Prompt { get; set; } = default!;
    public string? Explanation { get; set; }
    public byte? DifficultyLevel { get; set; }
    public decimal Points { get; set; }
    public decimal NegativePoints { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
