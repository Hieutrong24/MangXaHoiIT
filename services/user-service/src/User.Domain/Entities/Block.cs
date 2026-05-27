namespace User.Domain.Entities;

public class Block
{
    private Block() { } // EF

    public Block(Guid blockerId, Guid blockedId)
    {
        if (blockerId == Guid.Empty || blockedId == Guid.Empty) throw new ArgumentException("Empty id.");
        if (blockerId == blockedId) throw new ArgumentException("Cannot block self.");
        BlockerId = blockerId;
        BlockedId = blockedId;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid BlockerId { get; private set; }
    public Guid BlockedId { get; private set; }
    public DateTime CreatedAt { get; private set; }
}
