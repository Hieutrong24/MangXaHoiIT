namespace User.Domain.Entities;

public class Follow
{
    private Follow() { } // EF

    public Follow(Guid followerId, Guid followeeId)
    {
        if (followerId == Guid.Empty || followeeId == Guid.Empty) throw new ArgumentException("Empty id.");
        if (followerId == followeeId) throw new ArgumentException("Cannot follow self.");
        FollowerId = followerId;
        FolloweeId = followeeId;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid FollowerId { get; private set; }
    public Guid FolloweeId { get; private set; }
    public DateTime CreatedAt { get; private set; }
}
