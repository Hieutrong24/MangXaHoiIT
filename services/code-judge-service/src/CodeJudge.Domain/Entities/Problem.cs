using CodeJudge.Domain.Enums;

namespace CodeJudge.Domain.Entities;

public class Problem
{
    public Guid ProblemId { get; set; }
    public string Title { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public byte Difficulty { get; set; }
    public int TimeLimitMs { get; set; }
    public int MemoryLimitMB { get; set; }
    public string Statement { get; set; } = default!;
    public Guid CreatedByUserId { get; set; }
    public bool IsPublic { get; set; } = true;
    public ProblemStatus Status { get; set; } = ProblemStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string ProblemType { get; set; } = "code";
    public string SubmissionMode { get; set; } = "code";
    public byte? DifficultyLevel { get; set; }
    public Guid? PrimaryTopicId { get; set; }
    public string? Topic { get; set; }
    public string? SkillTag { get; set; }
    public short? EstimatedMinutes { get; set; }
    public int? PointsReward { get; set; }
    public int MaxScore { get; set; } = 100;
    public decimal PassPercentage { get; set; } = 100m;
    public string? InputFormat { get; set; }
    public string? OutputFormat { get; set; }
    public string? ConstraintsText { get; set; }
    public string? Notes { get; set; }
    public string? HintText { get; set; }
    public string? StarterCode { get; set; }
    public string? StarterCodeByLanguage { get; set; }
    public string? ReferenceSolution { get; set; }
    public string? EditorialText { get; set; }
    public string CheckerType { get; set; } = "exact";
    public bool AllowCustomInput { get; set; } = true;
    public bool AllowPartialScoring { get; set; }
    public bool IsFeatured { get; set; }
    public int SortOrder { get; set; }

    public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
}
