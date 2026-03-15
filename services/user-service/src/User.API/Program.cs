using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using User.API.Extensions;
using User.API.Middlewares;
using User.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "user-service",
        Version = "v1"
    });
});

builder.Services.AddUserService(builder.Configuration);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "2324802010028_NgoTrongHieu");
});
app.MapGet("/", () => "Auth API is running");
//app.UseHttpsRedirection();

app.UseMiddleware<ExceptionHandlingMiddleware>();
Console.WriteLine(builder.Configuration.GetConnectionString("DefaultConnection"));
app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<UserDbContext>();
    db.Database.Migrate();

}
app.Run();
