namespace User.Domain.Entities;

public class UserLink
{
    private UserLink() { } // EF

    public UserLink(Guid linkId, Guid userId, string type, string url)
    {
        LinkId = linkId;
        UserId = userId;
        Type = type;
        Url = url;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid LinkId { get; private set; }
    public Guid UserId { get; private set; }
    public string Type { get; private set; } = default!;
    public string Url { get; private set; } = default!;
    public DateTime CreatedAt { get; private set; }

    public User User { get; private set; } = default!;
}
