using User.Application.Interfaces;
using User.Application.Services;
using User.Infrastructure;

namespace User.API.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddUserService(this IServiceCollection services, IConfiguration config)
    {
        services.AddUserInfrastructure(config);
        services.AddScoped<IUserService, UserService>();
        services.AddTransient<User.API.Middlewares.ExceptionHandlingMiddleware>();
        return services;
    }
}
