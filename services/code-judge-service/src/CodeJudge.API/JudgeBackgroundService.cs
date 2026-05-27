using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Services;
using Microsoft.Extensions.Logging;

namespace CodeJudge.API;

public sealed class JudgeBackgroundService : BackgroundService
{
    private readonly IJudgeQueue _queue;
    private readonly IServiceProvider _sp;
    private readonly ILogger<JudgeBackgroundService> _logger;

    public JudgeBackgroundService(IJudgeQueue queue, IServiceProvider sp, ILogger<JudgeBackgroundService> logger)
    {
        _queue = queue;
        _sp = sp;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var submissionId in _queue.DequeueAllAsync(stoppingToken))
        {
            try
            {
                using var scope = _sp.CreateScope();
                var orchestrator = scope.ServiceProvider.GetRequiredService<JudgeOrchestrator>();
                await orchestrator.JudgeAsync(submissionId, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Judge background worker failed for submission {SubmissionId}", submissionId);
            }
        }
    }
}
