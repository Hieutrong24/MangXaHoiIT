using User.Domain.Enums;

namespace User.Domain.Entities;

public class FriendRequest
{
    private FriendRequest() { } // EF

    public FriendRequest(Guid requestId, Guid fromUserId, Guid toUserId, string? message)
    {
        if (requestId == Guid.Empty) throw new ArgumentException("RequestId empty.");
        if (fromUserId == Guid.Empty || toUserId == Guid.Empty) throw new ArgumentException("Empty id.");
        if (fromUserId == toUserId) throw new ArgumentException("Cannot friend self.");

        RequestId = requestId;
        FromUserId = fromUserId;
        ToUserId = toUserId;
        Message = string.IsNullOrWhiteSpace(message) ? null : message.Trim()[..Math.Min(message.Trim().Length, 200)];

        Status = FriendRequestStatus.Pending;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid RequestId { get; private set; }
    public Guid FromUserId { get; private set; }
    public Guid ToUserId { get; private set; }

    public FriendRequestStatus Status { get; private set; }
    public bool IsActive { get; private set; }
    public string? Message { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? RespondedAt { get; private set; }

    public void Accept()
    {
        EnsurePending();
        Status = FriendRequestStatus.Accepted;
        IsActive = false;
        RespondedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        EnsurePending();
        Status = FriendRequestStatus.Rejected;
        IsActive = false;
        RespondedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        EnsurePending();
        Status = FriendRequestStatus.Cancelled;
        IsActive = false;
        RespondedAt = DateTime.UtcNow;
    }

    private void EnsurePending()
    {
        if (Status != FriendRequestStatus.Pending || !IsActive)
            throw new InvalidOperationException("FriendRequest is not pending/active.");
    }
}
