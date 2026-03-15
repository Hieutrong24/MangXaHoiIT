using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Infrastructure.Persistence.Mongo;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using CodeJudge.Infrastructure.Repositories.Mongo;
using CodeJudge.Infrastructure.Repositories.SqlServer;
using CodeJudge.Infrastructure.Runners;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CodeJudge.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // SQL
        services.AddDbContext<JudgeDbContext>(opt =>
            opt.UseSqlServer(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IProblemRepository, ProblemRepository>();
        services.AddScoped<ITestCaseRepository, TestCaseRepository>();
        services.AddScoped<ILanguageRepository, LanguageRepository>();
        services.AddScoped<ISubmissionRepository, SubmissionRepository>();
        services.AddScoped<IJudgeResultRepository, JudgeResultRepository>();
        services.AddScoped<IUserProblemStatRepository, UserProblemStatRepository>();
        services.AddScoped<IOutboxRepository, OutboxRepository>();

        // Mongo
        services.Configure<MongoOptions>(opt =>
        {
            opt.ConnectionString = config["Mongo:ConnectionString"] ?? "mongodb://localhost:27017";
            opt.Database = config["Mongo:Database"] ?? "JudgeLogs";
        });

        services.AddSingleton<MongoContext>();
        services.AddScoped<IExecutionLogRepository, ExecutionLogRepository>();

        // Runner (NodeJS)
        var baseUrl = config["Runner:BaseUrl"] ?? "http://localhost:5001";
        services.AddHttpClient<ICodeRunnerClient, NodeRunnerClient>(http =>
        {
            http.BaseAddress = new Uri(baseUrl);
            http.Timeout = TimeSpan.FromSeconds(60);
        });

     
        services.Configure<Judge0Options>(opt =>
        {
            opt.BaseUrl = config["Judge0:BaseUrl"] ?? "https://ce.judge0.com";
            opt.ApiKey = config["Judge0:ApiKey"];    
            opt.UseWait = bool.TryParse(config["Judge0:UseWait"], out var useWait) ? useWait : true;
        });

        services.AddHttpClient<IJudge0Service, Judge0Service>(http =>
        {
             
            var judge0Base = config["Judge0:BaseUrl"] ?? "https://ce.judge0.com";
            http.BaseAddress = new Uri(judge0Base.TrimEnd('/') + "/");
            http.Timeout = TimeSpan.FromSeconds(60);
        });

        return services;
    }
}