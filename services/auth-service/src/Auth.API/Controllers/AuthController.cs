using Auth.API.Middlewares;
using Auth.Application.DTOs;
using Auth.Application.UseCases;
using Microsoft.AspNetCore.Mvc;

namespace Auth.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly LoginUseCase _login;
        private readonly RegisterUseCase _register;
        private readonly GoogleLoginUseCase _googleLogin;
        private readonly RefreshTokenUseCase _refresh;
        private readonly LogoutUseCase _logout;

        public AuthController(LoginUseCase login, RegisterUseCase register, GoogleLoginUseCase googleLogin, RefreshTokenUseCase refresh, LogoutUseCase logout)
        {
            _login = login;
            _register = register;
            _googleLogin = googleLogin;
            _refresh = refresh;
            _logout = logout;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var ip = HttpContext.Items[RequestContextMiddleware.ItemKey_Ip]?.ToString() ?? "unknown";
            var ua = HttpContext.Items[RequestContextMiddleware.ItemKey_UserAgent]?.ToString();

            var result = await _login.ExecuteAsync(request, ip, ua);
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _register.ExecuteAsync(request);
            return Ok(result);
        }

        [HttpPost("google/callback")]
        public async Task<IActionResult> GoogleCallback([FromBody] GoogleLoginRequest request, CancellationToken cancellationToken)
        {
            var ip = HttpContext.Items[RequestContextMiddleware.ItemKey_Ip]?.ToString() ?? "unknown";
            var ua = HttpContext.Items[RequestContextMiddleware.ItemKey_UserAgent]?.ToString();

            var result = await _googleLogin.ExecuteAsync(request, ip, ua, cancellationToken);
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            var ip = HttpContext.Items[RequestContextMiddleware.ItemKey_Ip]?.ToString() ?? "unknown";
            var ua = HttpContext.Items[RequestContextMiddleware.ItemKey_UserAgent]?.ToString();

            var result = await _refresh.ExecuteAsync(request, ip, ua);
            return Ok(result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
        {
            var ip = HttpContext.Items[RequestContextMiddleware.ItemKey_Ip]?.ToString() ?? "unknown";
            var ua = HttpContext.Items[RequestContextMiddleware.ItemKey_UserAgent]?.ToString();

            var raw = (request?.RefreshToken ?? string.Empty).Trim();
            await _logout.ExecuteAsync(raw, ip, ua);

            return Ok(new { message = "Logged out" });
        }
    }
}
