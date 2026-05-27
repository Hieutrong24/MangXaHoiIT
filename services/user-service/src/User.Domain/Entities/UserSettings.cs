namespace User.Domain.Entities;

public class UserSettings
{
    private UserSettings() { } // EF

    public UserSettings(Guid userId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId empty.");
        UserId = userId;

        PrivacyLevel = 1;
        AllowDM = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public Guid UserId { get; private set; }
    public byte PrivacyLevel { get; private set; } // 1..4
    public bool AllowDM { get; private set; }
    public string? NotifyPrefsJson { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public void Update(byte privacyLevel, bool allowDm, string? notifyPrefsJson)
    {
        if (privacyLevel is < 1 or > 4) throw new ArgumentOutOfRangeException(nameof(privacyLevel), "PrivacyLevel must be 1..4.");
        PrivacyLevel = privacyLevel;
        AllowDM = allowDm;
        NotifyPrefsJson = string.IsNullOrWhiteSpace(notifyPrefsJson) ? null : notifyPrefsJson.Trim();
        UpdatedAt = DateTime.UtcNow;
    }
}
