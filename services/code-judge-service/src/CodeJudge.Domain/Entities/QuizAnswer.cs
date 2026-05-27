using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_QuizAnswers")]
public class QuizAnswer
{
    [Key] public Guid QuizAnswerId { get; set; }
    public Guid QuizAttemptId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid? ChoiceId { get; set; }
    public string? AnswerText { get; set; }
    public bool IsCorrect { get; set; }
    public decimal PointsEarned { get; set; }
    public DateTime AnsweredAt { get; set; }
    public string? FeedbackText { get; set; }
}
