using auth_service.src.Auth.Application.Interfaces;
using auth_service.src.Auth.Application.Interfaces.Repositories;
using auth_service.src.Auth.Infrastructure.Configurations;
using auth_service.src.Auth.Infrastructure.Outbox;
using auth_service.src.Auth.Infrastructure.Persistence;
using auth_service.src.Auth.Infrastructure.Repositories;
using auth_service.src.Auth.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace auth_service.src.Auth.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            var cs =
                config.GetConnectionString("AuthDb")
                ?? config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Missing connection string: ConnectionStrings:AuthDb");

            services.AddDbContext<AuthDbContext>(opt =>
                opt.UseSqlServer(cs));

            services.Configure<JwtSettings>(config.GetSection("Jwt"));
            services.Configure<RabbitMqSettings>(config.GetSection("RabbitMq"));

            services.AddScoped<IAuthAccountRepository, AuthAccountRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<ILoginAuditRepository, LoginAuditRepository>();

            services.AddScoped<ITokenService, JwtTokenGenerator>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();

            services.AddScoped<IOutboxService, OutboxService>();
            services.AddHostedService<OutboxEventPublisher>();

            return services;
        }
    }
}