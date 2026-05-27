using auth_service.src.Auth.Domain.Enums;

namespace Auth.Application.DTOs
{
    public sealed record AdminAuthAccountDto(
        Guid UserId,
        string Email,
        bool IsEmailVerified,
        AccountStatus Status,
        IReadOnlyList<string> Roles,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );

    public sealed record AdminLoginAuditDto(
        long Id,
        Guid? UserId,
        string Email,
        bool Success,
        string? FailureReason,
        string? IpAddress,
        string? UserAgent,
        DateTime CreatedAt
    );

    public sealed record SetAccountStatusRequest(string? Reason = null);
    public sealed record UpdateUserRolesRequest(IReadOnlyList<string> Roles);
}
