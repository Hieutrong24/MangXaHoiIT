using CodeJudge.API;
using CodeJudge.API.Extensions;
using CodeJudge.API.Middlewares;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Services;
using CodeJudge.Infrastructure;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using CodeJudge.Infrastructure.Runners;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSwaggerDocs();
builder.Services.AddAuth();
builder.Services.AddCodeJudge(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddSingleton<IJudgeQueue, InMemoryJudgeQueue>();
builder.Services.AddHostedService<JudgeBackgroundService>();
builder.Services.AddHttpClient<IJudge0Service, Judge0Service>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Judge0:BaseUrl"] ?? "https://ce.judge0.com");
});
var app = builder.Build();

// middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<CorrelationIdMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerDocs();
}

app.UseRouting();

 
app.UseAuth();             
app.UseAuthorization();  
app.MapGet("/", () => "CodeJudge API is running");
app.MapControllers();

// seed data
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<JudgeDbContext>();
        if (await db.Database.CanConnectAsync())
        {
            var langSvc = scope.ServiceProvider.GetRequiredService<ILanguageService>();
            await langSvc.SeedDefaultAsync();
        }
        else
        {
            app.Logger.LogWarning("Cannot connect to JudgeDB. Skip seeding.");
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Seed failed. Continue running.");
    }
}

app.Run();