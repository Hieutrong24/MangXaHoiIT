namespace User.Domain.Enums;

public enum FriendRequestStatus : byte
{
    Pending = 1,
    Accepted = 2,
    Rejected = 3,
    Cancelled = 4
}
