namespace CodeJudge.Domain.Entities;

public class TestCase
{
    public Guid TestCaseId { get; set; }
    public Guid ProblemId { get; set; }
    public Problem? Problem { get; set; }

    public byte[]? InputData { get; set; }
    public byte[]? OutputData { get; set; }
    public bool IsSample { get; set; }
    public decimal Score { get; set; }
    public int OrderNo { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? CaseGroup { get; set; }
    public decimal Weight { get; set; } = 1m;
    public bool IsHidden { get; set; } = true;
    public string? InputText { get; set; }
    public string? ExpectedOutputText { get; set; }
    public int? MaxTimeMs { get; set; }
    public int? MaxMemoryKB { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
