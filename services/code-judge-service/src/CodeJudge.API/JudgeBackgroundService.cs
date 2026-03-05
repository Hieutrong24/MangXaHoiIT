using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Services;

namespace CodeJudge.API;

public sealed class JudgeBackgroundService : BackgroundService
{
    private readonly IJudgeQueue _queue;
    private readonly IServiceProvider _sp;

    public JudgeBackgroundService(IJudgeQueue queue, IServiceProvider sp)
    {
        _queue = queue;
        _sp = sp;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var submissionId in _queue.DequeueAllAsync(stoppingToken))
        {
            using var scope = _sp.CreateScope();
            var orchestrator = scope.ServiceProvider.GetRequiredService<JudgeOrchestrator>();
            await orchestrator.JudgeAsync(submissionId, stoppingToken);
        }
    }
}
