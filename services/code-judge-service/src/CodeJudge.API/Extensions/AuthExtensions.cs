namespace CodeJudge.API.Extensions;

public static class AuthExtensions
{
    public static IServiceCollection AddAuth(this IServiceCollection services) => services;
    public static IApplicationBuilder UseAuth(this IApplicationBuilder app) => app;
}
