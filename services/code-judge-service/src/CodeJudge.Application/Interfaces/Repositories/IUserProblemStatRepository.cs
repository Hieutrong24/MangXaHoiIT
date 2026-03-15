namespace CodeJudge.Application.Interfaces.Repositories;

public interface IUserProblemStatRepository
{
    Task UpsertAsync(
        Guid userId,
        Guid problemId,
        byte submissionStatus,
        int? totalTimeMs,
        int? totalMemoryKb,
        int score,
        DateTime submittedAt,
        CancellationToken ct = default
    );
}
