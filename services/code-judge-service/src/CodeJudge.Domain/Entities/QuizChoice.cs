using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_QuizChoices")]
public class QuizChoice
{
    [Key] public Guid ChoiceId { get; set; }
    public Guid QuestionId { get; set; }
    public string ChoiceText { get; set; } = default!;
    public string? ChoiceValue { get; set; }
    public bool IsCorrect { get; set; }
    public string? FeedbackText { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
