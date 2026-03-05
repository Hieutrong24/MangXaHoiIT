using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CodeJudge.Application.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProblemService, ProblemService>();
        services.AddScoped<ITestCaseService, TestCaseService>();
        services.AddScoped<ILanguageService, LanguageService>();
        services.AddScoped<ISubmissionService, SubmissionService>();
        services.AddScoped<JudgeOrchestrator>();
        return services;
    }
}
