using System.Text;
using auth_service.src.Auth.Infrastructure.Configurations;
using auth_service.src.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace auth_service.src.Auth.Infrastructure.Outbox
{
    public class OutboxEventPublisher : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<OutboxEventPublisher> _logger;
        private readonly RabbitMqSettings _rabbitSettings;

        private IConnection? _connection;
        private IModel? _channel;

        public OutboxEventPublisher(
            IServiceScopeFactory scopeFactory,
            ILogger<OutboxEventPublisher> logger,
            IOptions<RabbitMqSettings> rabbitOptions)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _rabbitSettings = rabbitOptions.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("OutboxEventPublisher started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    EnsureRabbitMq();

                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();

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
                        try
                        {
                            var routingKey = MapRoutingKey(evt.EventType);
                            var body = Encoding.UTF8.GetBytes(evt.PayloadJson);

                            var props = _channel!.CreateBasicProperties();
                            props.ContentType = "application/json";
                            props.DeliveryMode = 2;
                            props.MessageId = evt.EventId.ToString();
                            props.Timestamp = new AmqpTimestamp(
                                new DateTimeOffset(evt.OccurredAt).ToUnixTimeSeconds());

                            if (!string.IsNullOrWhiteSpace(evt.TraceId))
                                props.CorrelationId = evt.TraceId;

                            _channel.BasicPublish(
                                exchange: _rabbitSettings.Exchange,
                                routingKey: routingKey,
                                basicProperties: props,
                                body: body);

                            evt.ProcessedAt = DateTime.UtcNow;

                            _logger.LogInformation(
                                "Published outbox event {EventId} type {EventType} to exchange {Exchange} with routing key {RoutingKey}",
                                evt.EventId,
                                evt.EventType,
                                _rabbitSettings.Exchange,
                                routingKey);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(
                                ex,
                                "Failed to publish outbox event {EventId} type {EventType}",
                                evt.EventId,
                                evt.EventType);
                        }
                    }

                    await db.SaveChangesAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Outbox publisher error");
                    await Task.Delay(2000, stoppingToken);
                }
            }

            _logger.LogInformation("OutboxEventPublisher stopped");
        }

        private void EnsureRabbitMq()
        {
            if (_connection is { IsOpen: true } && _channel is { IsOpen: true })
                return;

            try
            {
                _channel?.Dispose();
            }
            catch
            {
            }

            try
            {
                _connection?.Dispose();
            }
            catch
            {
            }

            var factory = new ConnectionFactory
            {
                HostName = _rabbitSettings.Host,
                Port = _rabbitSettings.Port,
                UserName = _rabbitSettings.Username,
                Password = _rabbitSettings.Password,
                VirtualHost = _rabbitSettings.VirtualHost,
                DispatchConsumersAsync = true
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            _channel.ExchangeDeclare(
                exchange: _rabbitSettings.Exchange,
                type: ExchangeType.Topic,
                durable: true,
                autoDelete: false);

            _logger.LogInformation(
                "Connected RabbitMQ {Host}:{Port}, exchange={Exchange}",
                _rabbitSettings.Host,
                _rabbitSettings.Port,
                _rabbitSettings.Exchange);
        }

        private static string MapRoutingKey(string eventType)
        {
            return eventType switch
            {
                "UserLoggedInEvent" => "auth.user_logged_in",
                "Auth.AccountSeeded" => "auth.account_seeded",
                _ => throw new InvalidOperationException(
                    $"No routing key mapping for event type '{eventType}'")
            };
        }

        public override void Dispose()
        {
            try
            {
                _channel?.Dispose();
            }
            catch
            {
            }

            try
            {
                _connection?.Dispose();
            }
            catch
            {
            }

            base.Dispose();
        }
    }
}