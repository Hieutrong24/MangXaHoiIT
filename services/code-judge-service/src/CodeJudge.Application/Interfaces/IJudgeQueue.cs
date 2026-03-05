namespace CodeJudge.Application.Interfaces;

public interface IJudgeQueue
{
    ValueTask EnqueueAsync(Guid submissionId, CancellationToken ct = default);
    IAsyncEnumerable<Guid> DequeueAllAsync(CancellationToken ct = default);
}
