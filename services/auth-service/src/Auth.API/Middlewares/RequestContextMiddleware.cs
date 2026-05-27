using System.Net;

namespace Auth.API.Middlewares
{
    public class RequestContextMiddleware
    {
        public const string ItemKey_Ip = "ClientIp";
        public const string ItemKey_UserAgent = "UserAgent";

        private readonly RequestDelegate _next;

        public RequestContextMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            context.Items[ItemKey_Ip] = GetClientIp(context);
            context.Items[ItemKey_UserAgent] = context.Request.Headers.UserAgent.ToString();

            await _next(context);
        }

        private static string GetClientIp(HttpContext context)
        {
            
            var xff = context.Request.Headers["X-Forwarded-For"].ToString();
            if (!string.IsNullOrWhiteSpace(xff))
            {
                var first = xff.Split(',')[0].Trim();
                if (!string.IsNullOrWhiteSpace(first))
                    return first;
            }

            var ip = context.Connection.RemoteIpAddress;
            if (ip is null) return "unknown";

          
            if (IPAddress.IsLoopback(ip)) return "127.0.0.1";

            return ip.ToString();
        }
    }
}
