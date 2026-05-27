using Auth.Application.DTOs;

namespace auth_service.src.Auth.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request, string ip, string? userAgent);
        Task LogoutAsync(Guid userId, string ip, string? userAgent);
    }
}
