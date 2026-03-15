using CodeJudge.Domain.Enums;

namespace CodeJudge.Domain.Entities;

public class Problem
{
    public Guid ProblemId { get; set; }
    public string Title { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public byte Difficulty { get; set; } // 1..5
    public int TimeLimitMs { get; set; }
    public int MemoryLimitMB { get; set; }
    public string Statement { get; set; } = default!;
    public Guid CreatedByUserId { get; set; }
    public bool IsPublic { get; set; } = true;
    public ProblemStatus Status { get; set; } = ProblemStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
}
