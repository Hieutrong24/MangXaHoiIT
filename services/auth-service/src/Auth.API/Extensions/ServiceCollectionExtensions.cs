using Auth.API.Filters;
using Auth.Application.UseCases;
using Microsoft.OpenApi.Models;

namespace Auth.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddAuthApi(this IServiceCollection services)
        {
            services.AddControllers(o =>
            {
                o.Filters.Add<GlobalExceptionFilter>();
            });

            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Auth Service", Version = "v1" });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // UseCases
            services.AddScoped<LoginUseCase>();
            services.AddScoped<RefreshTokenUseCase>();
            services.AddScoped<LogoutUseCase>();

            return services;
        }
    }
}
