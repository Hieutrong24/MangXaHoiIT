using Microsoft.OpenApi.Models;

namespace CodeJudge.API.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocs(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "CodeJudge.API",
                Version = "v1"
            });

  
            c.CustomSchemaIds(t => (t.FullName ?? t.Name).Replace("+", "."));
        });

        return services;
    }

    public static IApplicationBuilder UseSwaggerDocs(this IApplicationBuilder app)
    {
        app.UseSwagger();

        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "CodeJudge.API v1");
        });

        return app;
    }
}
