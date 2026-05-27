using User.Domain.Enums;
using User.Domain.Events;
using User.Domain.ValueObjects;

namespace User.Domain.Entities;

public class User : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = new();

    private User() { } // EF

    public User(Guid userId, StudentCode studentCode, string username, string fullName, TDMUEmail? tdmuEmail)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId is empty.");
        StudentCode = studentCode;
        Username = Guard(username, 50, nameof(username));
        FullName = Guard(fullName, 120, nameof(fullName));

        UserId = userId;
        TDMUEmail = tdmuEmail;
        Status = UserStatus.Active;

        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        
        Settings = new UserSettings(userId);

        _domainEvents.Add(new UserCreatedDomainEvent(userId, studentCode.Value, Username));
    }

    public Guid UserId { get; private set; }
    public StudentCode StudentCode { get; private set; }
    public string Username { get; private set; } = default!;
    public string FullName { get; private set; } = default!;
    public TDMUEmail? TDMUEmail { get; private set; }

    public string? Department { get; private set; }
    public string? Major { get; private set; }
    public string? ClassName { get; private set; }
    public short? EnrollmentYear { get; private set; }

    public string? AvatarUrl { get; private set; }
    public string? CoverUrl { get; private set; }
    public string? Bio { get; private set; }

    public UserStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public UserSettings Settings { get; private set; } = default!;
    public ICollection<UserLink> Links { get; private set; } = new List<UserLink>();

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    public void ClearDomainEvents() => _domainEvents.Clear();

    public void UpdateProfile(
        string? fullName,
        string? department,
        string? major,
        string? className,
        short? enrollmentYear,
        string? avatarUrl,
        string? coverUrl,
        string? bio,
        string? tdmuEmail)
    {
        if (Status is UserStatus.Deleted) throw new InvalidOperationException("User is deleted.");

        if (!string.IsNullOrWhiteSpace(fullName)) FullName = Guard(fullName, 120, nameof(fullName));
        Department = TrimMax(department, 100);
        Major = TrimMax(major, 100);
        ClassName = TrimMax(className, 50);

        if (enrollmentYear is not null && (enrollmentYear < 2000 || enrollmentYear > 2100))
            throw new ArgumentOutOfRangeException(nameof(enrollmentYear), "EnrollmentYear must be between 2000 and 2100.");

        EnrollmentYear = enrollmentYear;
        AvatarUrl = TrimMax(avatarUrl, 500);
        CoverUrl = TrimMax(coverUrl, 500);
        Bio = TrimMax(bio, 500);

        if (tdmuEmail is null) TDMUEmail = null;
        else if (string.IsNullOrWhiteSpace(tdmuEmail)) TDMUEmail = null;
        else TDMUEmail = ValueObjects.TDMUEmail.Create(tdmuEmail);

        Touch();
    }

    public void SetStatus(UserStatus status)
    {
        Status = status;
        Touch();
    }

    public UserLink AddLink(Guid linkId, string type, string url)
    {
        if (linkId == Guid.Empty) throw new ArgumentException("LinkId empty.");
        type = Guard(type, 30, nameof(type)).ToLowerInvariant();
        url = Guard(url, 500, nameof(url));

        var allowed = new HashSet<string> { "github", "linkedin", "portfolio", "facebook", "other" };
        if (!allowed.Contains(type)) throw new ArgumentException("Invalid link type.", nameof(type));

        var link = new UserLink(linkId, UserId, type, url);
        Links.Add(link);
        Touch();
        return link;
    }

    public void RemoveLink(Guid linkId)
    {
        var link = Links.FirstOrDefault(x => x.LinkId == linkId);
        if (link is null) return;
        Links.Remove(link);
        Touch();
    }

    private void Touch() => UpdatedAt = DateTime.UtcNow;

    private static string Guard(string value, int maxLen, string name)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException($"{name} is required.", name);
        value = value.Trim();
        if (value.Length > maxLen) throw new ArgumentException($"{name} max length is {maxLen}.", name);
        return value;
    }

    private static string? TrimMax(string? value, int maxLen)
    {
        if (value is null) return null;
        value = value.Trim();
        if (value.Length == 0) return null;
        return value.Length <= maxLen ? value : value[..maxLen];
    }
}
