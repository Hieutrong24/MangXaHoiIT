using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface IJudgeResultRepository
{
    Task DeleteBySubmissionAsync(Guid submissionId, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<JudgeResult> results, CancellationToken ct = default);
    Task<List<JudgeResult>> ListBySubmissionAsync(Guid submissionId, CancellationToken ct = default);
}
