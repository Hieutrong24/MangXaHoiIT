using User.Domain.Enums;

namespace User.Application.DTOs;

public sealed record UserProfileDto(
    Guid UserId,
    string Username,
    string FullName,
    string? AvatarUrl,
    string? CoverUrl,
    string? Bio,
    string? Department,
    string? Major,
    string? ClassName,
    short? EnrollmentYear,
    UserStatus Status,
    int FollowersCount,
    int FollowingCount,
    bool IsFollowing
);
