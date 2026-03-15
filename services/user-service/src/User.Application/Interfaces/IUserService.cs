using User.Application.Common;
using User.Application.DTOs;

namespace User.Application.Interfaces;

public interface IUserService
{
    Task<Result<UserDto>> CreateUserAsync(CreateUserRequest req, CancellationToken ct = default);
    Task<Result<UserDto>> GetUserAsync(Guid userId, CancellationToken ct = default);
    Task<Result<UserDto>> UpdateUserAsync(Guid userId, UpdateUserRequest req, CancellationToken ct = default);

    Task<Result<UserProfileDto>> GetProfileAsync(Guid userId, Guid viewerId, CancellationToken ct = default);

    Task<Result<UserSettingsDto>> GetSettingsAsync(Guid userId, CancellationToken ct = default);
    Task<Result<UserSettingsDto>> UpdateSettingsAsync(Guid userId, UpdateUserSettingsRequest req, CancellationToken ct = default);

    Task<Result<IReadOnlyList<UserLinkDto>>> GetLinksAsync(Guid userId, CancellationToken ct = default);
    Task<Result<UserLinkDto>> AddLinkAsync(Guid userId, AddUserLinkRequest req, CancellationToken ct = default);
    Task<Result> RemoveLinkAsync(Guid userId, Guid linkId, CancellationToken ct = default);

    Task<Result> FollowAsync(Guid actorUserId, Guid targetUserId, CancellationToken ct = default);
    Task<Result> UnfollowAsync(Guid actorUserId, Guid targetUserId, CancellationToken ct = default);

    Task<Result<FriendRequestDto>> SendFriendRequestAsync(Guid actorUserId, Guid toUserId, SendFriendRequestRequest req, CancellationToken ct = default);
    Task<Result> AcceptFriendRequestAsync(Guid actorUserId, Guid requestId, CancellationToken ct = default);
    Task<Result> RejectFriendRequestAsync(Guid actorUserId, Guid requestId, CancellationToken ct = default);
    Task<Result> CancelFriendRequestAsync(Guid actorUserId, Guid requestId, CancellationToken ct = default);

    Task<Result> BlockAsync(Guid actorUserId, Guid blockedUserId, CancellationToken ct = default);
    Task<Result> UnblockAsync(Guid actorUserId, Guid blockedUserId, CancellationToken ct = default);
    Task<Result<PagedResult<UserLiteDto>>> ListFriendsAsync(Guid actorUserId, int page, int pageSize, CancellationToken ct);
    Task<Result<List<UserLiteDto>>> ListFriendSuggestionsAsync(Guid actorUserId, int limit, CancellationToken ct);
    Task<Result<List<UserLiteDto>>> ListAllUsersAsync(CancellationToken ct);
    Task<Result<PagedResult<FriendRequestDto>>> ListIncomingFriendRequestsAsync(
    Guid actorUserId, int page, int pageSize, CancellationToken ct = default);

    Task<Result<PagedResult<FriendRequestDto>>> ListOutgoingFriendRequestsAsync(
        Guid actorUserId, int page, int pageSize, CancellationToken ct = default);
}

