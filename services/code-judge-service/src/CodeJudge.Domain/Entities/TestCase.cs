namespace CodeJudge.Domain.Entities;

public class TestCase
{
    public Guid TestCaseId { get; set; }
    public Guid ProblemId { get; set; }
    public Problem? Problem { get; set; }

    public byte[] InputData { get; set; } = default!;
    public byte[] OutputData { get; set; } = default!;
    public bool IsSample { get; set; }
    public int Score { get; set; }
    public int OrderNo { get; set; }
}
