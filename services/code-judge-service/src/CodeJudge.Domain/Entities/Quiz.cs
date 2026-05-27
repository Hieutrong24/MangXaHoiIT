using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeJudge.Domain.Entities;

[Table("Judge_Quizzes")]
public class Quiz
{
    [Key] public Guid QuizId { get; set; }
    public Guid? LessonId { get; set; }
    public Guid? PathId { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string QuizType { get; set; } = "mcq";
    public byte? DifficultyLevel { get; set; }
    public int? TimeLimitSeconds { get; set; }
    public decimal PassingScore { get; set; }
    public int? MaxAttempts { get; set; }
    public bool ShuffleQuestions { get; set; }
    public bool ShuffleChoices { get; set; }
    public bool IsPublished { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int PointsReward { get; set; }
    public int XpReward { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
