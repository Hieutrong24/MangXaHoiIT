using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using User.Application.Interfaces;
using User.Application.Interfaces.Repositories;
using User.Infrastructure.Configurations;

namespace User.Infrastructure.Outbox;

public sealed class OutboxPublisher : BackgroundService
{
    private readonly ILogger<OutboxPublisher> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly RabbitMqSettings _rabbitSettings;

    private IConnection? _connection;
    private IModel? _channel;

    public OutboxPublisher(
        ILogger<OutboxPublisher> logger,
        IServiceScopeFactory scopeFactory,
        IOptions<RabbitMqSettings> rabbitOptions)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
        _rabbitSettings = rabbitOptions.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("User OutboxPublisher started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                EnsureRabbitMq();

                using var scope = _scopeFactory.CreateScope();

                var outboxRepo = scope.ServiceProvider.GetRequiredService<IOutboxRepository>();
                var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                var batch = await outboxRepo.GetUnprocessedAsync(50, stoppingToken);

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

                        _logger.LogInformation(
                            "Published outbox event {EventId} type {EventType} to exchange {Exchange} with routing key {RoutingKey}",
                            evt.EventId,
                            evt.EventType,
                            _rabbitSettings.Exchange,
                            routingKey);

                        await outboxRepo.MarkProcessedAsync(evt.EventId, stoppingToken);
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

                if (batch.Count > 0)
                    await uow.SaveChangesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OutboxPublisher error");
            }

            await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);
        }

        _logger.LogInformation("User OutboxPublisher stopped");
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
            "FriendRequestSentEvent" => "friend_request.sent",
            "FriendRequestAcceptedEvent" => "friend_request.accepted",
            "UserFollowedEvent" => "user.followed",
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