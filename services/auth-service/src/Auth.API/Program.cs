using Auth.API.Extensions;
using auth_service.src.Auth.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// API layer
builder.Services.AddAuthApi();

// Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Middleware pipeline
// app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseAuthApi();

app.MapGet("/", () => "Auth API is running");
app.MapControllers();

app.Run();