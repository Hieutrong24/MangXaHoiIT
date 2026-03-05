using Auth.API.Extensions;
using auth_service.src.Auth.Infrastructure; // AddInfrastructure

var builder = WebApplication.CreateBuilder(args);

// API layer
builder.Services.AddAuthApi();

// Infrastructure (DbContext, Repos, Security, Outbox...)
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// pipeline
//app.UseHttpsRedirection();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/", () => "Auth API is running");

app.UseAuthApi(); // RequestContextMiddleware

app.MapControllers();

app.Run();
