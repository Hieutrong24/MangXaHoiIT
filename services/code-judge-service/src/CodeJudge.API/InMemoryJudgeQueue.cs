using System.Threading.Channels;
using CodeJudge.Application.Interfaces;

namespace CodeJudge.API;

public sealed class InMemoryJudgeQueue : IJudgeQueue
{
    private readonly Channel<Guid> _ch = Channel.CreateUnbounded<Guid>();

    public ValueTask EnqueueAsync(Guid submissionId, CancellationToken ct = default)
        => _ch.Writer.WriteAsync(submissionId, ct);

    public async IAsyncEnumerable<Guid> DequeueAllAsync([System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
    {
        while (await _ch.Reader.WaitToReadAsync(ct))
        {
            while (_ch.Reader.TryRead(out var item))
                yield return item;
        }
    }
}
