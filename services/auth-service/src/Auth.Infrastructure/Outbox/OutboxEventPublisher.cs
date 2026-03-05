using auth_service.src.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace auth_service.src.Auth.Infrastructure.Outbox
{
    public class OutboxEventPublisher : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<OutboxEventPublisher> _logger;

        public OutboxEventPublisher(IServiceScopeFactory scopeFactory, ILogger<OutboxEventPublisher> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();

                    // Lấy các event chưa processed
                    var batch = await db.AuthOutboxEvents
                        .Where(x => x.ProcessedAt == null)
                        .OrderBy(x => x.OccurredAt)
                        .Take(20)
                        .ToListAsync(stoppingToken);

                    if (batch.Count == 0)
                    {
                        await Task.Delay(1500, stoppingToken);
                        continue;
                    }

                    foreach (var evt in batch)
                    {
                        // TODO: publish ra message broker (Kafka/Rabbit/...)
                        // Hiện tại chỉ mark processed để không bị lặp
                        evt.ProcessedAt = DateTime.UtcNow;
                    }

                    await db.SaveChangesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Outbox publisher error");
                    await Task.Delay(2000, stoppingToken);
                }
            }
        }
    }
}
