using User.Domain.Enums;

namespace User.Application.DTOs;

public sealed record UserDto(
    Guid UserId,
    string StudentCode,
    string Username,
    string FullName,
    string? TDMUEmail,
    string? Department,
    string? Major,
    string? ClassName,
    short? EnrollmentYear,
    string? AvatarUrl,
    string? CoverUrl,
    string? Bio,
    UserStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
