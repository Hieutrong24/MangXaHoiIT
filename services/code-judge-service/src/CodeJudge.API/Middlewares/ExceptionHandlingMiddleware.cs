using System.Net;

namespace CodeJudge.API.Middlewares;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task Invoke(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
     
            if (ctx.Request.Path.StartsWithSegments("/swagger"))
                throw;

            ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            ctx.Response.ContentType = "application/json";

            await ctx.Response.WriteAsJsonAsync(new
            {
                error = ex.Message,
                trace = ex.GetType().Name,
                detail = _env.IsDevelopment() ? ex.ToString() : null
            });
        }
    }
}
