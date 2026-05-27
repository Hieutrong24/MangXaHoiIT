namespace User.Application.DTOs;

public sealed record UserLiteQueryRow(
    Guid UserId,
    string Username,
    string FullName,
    string? AvatarUrl,
    string? ClassName,
    string? Major,
    byte Status
);
