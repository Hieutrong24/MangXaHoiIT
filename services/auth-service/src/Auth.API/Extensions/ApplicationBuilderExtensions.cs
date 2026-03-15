using Auth.API.Middlewares;

namespace Auth.API.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseAuthApi(this IApplicationBuilder app)
        {
            app.UseMiddleware<RequestContextMiddleware>();
            return app;
        }
    }
}
