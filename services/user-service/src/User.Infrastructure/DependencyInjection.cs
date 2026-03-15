using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using User.Application.Interfaces;
using User.Application.Interfaces.Repositories;
using User.Application.Services;
using User.Infrastructure.Configurations;
using User.Infrastructure.Outbox;
using User.Infrastructure.Persistence;
using User.Infrastructure.Repositories;

namespace User.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddUserInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var cs = config.GetConnectionString("DefaultConnection")
                 ?? throw new InvalidOperationException("Missing connection string: ConnectionStrings:DefaultConnection");

        services.AddDbContext<UserDbContext>(opt =>
            opt.UseSqlServer(cs, sql =>
            {
                sql.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null);
            }));

        services.Configure<RabbitMqSettings>(config.GetSection("RabbitMq"));

        services.AddSingleton<OutboxService>();
        services.AddHostedService<OutboxPublisher>();

        services.AddScoped<IIntegrationEventWriter, IntegrationEventWriter>();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserSettingsRepository, UserSettingsRepository>();
        services.AddScoped<IUserLinkRepository, UserLinkRepository>();
        services.AddScoped<IFollowRepository, FollowRepository>();
        services.AddScoped<IFriendRequestRepository, FriendRequestRepository>();
        services.AddScoped<IBlockRepository, BlockRepository>();
        services.AddScoped<IOutboxRepository, OutboxRepository>();

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}