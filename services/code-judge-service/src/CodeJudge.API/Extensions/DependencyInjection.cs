using CodeJudge.Application.Extensions;
using CodeJudge.Infrastructure;

namespace CodeJudge.API.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddCodeJudge(this IServiceCollection services, IConfiguration config)
    {
        services.AddApplication();
        services.AddInfrastructure(config);
        return services;
    }
}
