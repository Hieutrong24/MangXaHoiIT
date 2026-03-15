namespace User.Application.DTOs;

public sealed record UserSettingsDto(Guid UserId, byte PrivacyLevel, bool AllowDM, string? NotifyPrefsJson, DateTime UpdatedAt);
public sealed record UserLinkDto(Guid LinkId, Guid UserId, string Type, string Url, DateTime CreatedAt);

public sealed record FriendRequestDto(
    Guid RequestId,
    Guid FromUserId,
    Guid ToUserId,
    byte Status,
    bool IsActive,
    string? Message,
    DateTime CreatedAt,
    DateTime? RespondedAt
);
