namespace User.Application.DTOs;



public sealed record CreateUserRequest(
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
    string? Bio
);

public sealed record UpdateUserRequest(
    string? FullName,
    string? Department,
    string? Major,
    string? ClassName,
    short? EnrollmentYear,
    string? AvatarUrl,
    string? CoverUrl,
    string? Bio,
    string? TDMUEmail
);

public sealed record UpdateUserSettingsRequest(
    byte PrivacyLevel,
    bool AllowDM,
    string? NotifyPrefsJson
);

public sealed record AddUserLinkRequest(
    string Type,
    string Url
);

public sealed record SendFriendRequestRequest(
    string? Message
);
