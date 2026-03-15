namespace User.API.Extensions;

public static class HttpContextExtensions
{
    public static Guid GetActorUserId(this HttpContext ctx)
    {
        if (ctx.Request.Headers.TryGetValue("X-User-Id", out var values)
            && Guid.TryParse(values.FirstOrDefault(), out var id)
            && id != Guid.Empty)
        {
            return id;
        }

        return Guid.Empty;
    }
}
