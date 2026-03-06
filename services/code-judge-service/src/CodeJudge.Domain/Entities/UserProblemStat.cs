namespace CodeJudge.Domain.Entities;

public class UserProblemStat
{
    public Guid UserId { get; set; }
    public Guid ProblemId { get; set; }
    public Problem? Problem { get; set; }

    public byte BestStatus { get; set; } 
    public int? BestTimeMs { get; set; }
    public int? BestMemoryKB { get; set; }
    public int Attempts { get; set; }
    public DateTime LastSubmittedAt { get; set; }
    public DateTime? FirstAcceptedAt { get; set; }
}
