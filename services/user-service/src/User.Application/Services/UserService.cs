using User.Application.Common;
using User.Application.DTOs;
using User.Application.Interfaces;
using User.Application.Interfaces.Repositories;
using User.Domain.Enums;
using User.Domain.ValueObjects;
using DomainFriendRequest = User.Domain.Entities.FriendRequest;
using DomainUser = User.Domain.Entities.User;
using DomainUserLink = User.Domain.Entities.UserLink;
using DomainUserSettings = User.Domain.Entities.UserSettings;

namespace User.Application.Services;

public sealed class UserService : IUserService
{
    private readonly IUserRepository _users;
    private readonly IUserSettingsRepository _settings;
    private readonly IUserLinkRepository _links;
    private readonly IFollowRepository _follows;
    private readonly IFriendRequestRepository _friendRequests;
    private readonly IBlockRepository _blocks;
    private readonly IUnitOfWork _uow;
    private readonly IIntegrationEventWriter _integrationEvents;

    public UserService(
        IUserRepository users,
        IUserSettingsRepository settings,
        IUserLinkRepository links,
        IFollowRepository follows,
        IFriendRequestRepository friendRequests,
        IBlockRepository blocks,
        IUnitOfWork uow,
        IIntegrationEventWriter integrationEvents)
    {
        _users = users;
        _settings = settings;
        _links = links;
        _follows = follows;
        _friendRequests = friendRequests;
        _blocks = blocks;
        _uow = uow;
        _integrationEvents = integrationEvents;
    }

    public async Task<Result<UserDto>> CreateUserAsync(CreateUserRequest req, CancellationToken ct = default)
    {
        try
        {
            var studentCode = StudentCode.Create(req.StudentCode);
            var username = (req.Username ?? string.Empty).Trim();
            var fullName = (req.FullName ?? string.Empty).Trim();

            var email = string.IsNullOrWhiteSpace(req.TDMUEmail)
                ? (TDMUEmail?)null
                : TDMUEmail.Create(req.TDMUEmail!);

            if (await _users.ExistsStudentCodeAsync(studentCode.Value, ct))
                return Result<UserDto>.Failure(ErrorCodes.Conflict, "StudentCode already exists.");

            if (await _users.ExistsUsernameAsync(username, ct))
                return Result<UserDto>.Failure(ErrorCodes.Conflict, "Username already exists.");

            if (email is not null && await _users.ExistsEmailAsync(email.Value.Value, ct))
                return Result<UserDto>.Failure(ErrorCodes.Conflict, "Email already exists.");

            var user = new DomainUser(Guid.NewGuid(), studentCode, username, fullName, email);

            user.UpdateProfile(
                fullName: null,
                department: req.Department,
                major: req.Major,
                className: req.ClassName,
                enrollmentYear: req.EnrollmentYear,
                avatarUrl: req.AvatarUrl,
                coverUrl: req.CoverUrl,
                bio: req.Bio,
                tdmuEmail: req.TDMUEmail
            );

            await _users.AddAsync(user, ct);
            await _uow.SaveChangesAsync(ct);

            return Result<UserDto>.Success(ToDto(user));
        }
        catch (Exception ex)
        {
            return Result<UserDto>.Failure(ErrorCodes.Validation, ex.Message);
        }
    }

    public async Task<Result<UserDto>> GetUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result<UserDto>.Failure(ErrorCodes.NotFound, "User not found.");

        return Result<UserDto>.Success(ToDto(user));
    }

    public async Task<Result<UserDto>> UpdateUserAsync(Guid userId, UpdateUserRequest req, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result<UserDto>.Failure(ErrorCodes.NotFound, "User not found.");

        try
        {
            if (!string.IsNullOrWhiteSpace(req.TDMUEmail))
            {
                var normalized = req.TDMUEmail.Trim();

                if (await _users.ExistsEmailAsync(normalized, ct))
                {
                    if (user.TDMUEmail?.Value != normalized)
                        return Result<UserDto>.Failure(ErrorCodes.Conflict, "Email already exists.");
                }
            }

            user.UpdateProfile(
                req.FullName,
                req.Department,
                req.Major,
                req.ClassName,
                req.EnrollmentYear,
                req.AvatarUrl,
                req.CoverUrl,
                req.Bio,
                req.TDMUEmail);

            await _uow.SaveChangesAsync(ct);
            return Result<UserDto>.Success(ToDto(user));
        }
        catch (Exception ex)
        {
            return Result<UserDto>.Failure(ErrorCodes.Validation, ex.Message);
        }
    }

    public async Task<Result<UserProfileDto>> GetProfileAsync(Guid userId, Guid viewerId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result<UserProfileDto>.Failure(ErrorCodes.NotFound, "User not found.");

        var blocked = await _blocks.IsBlockedBetweenAsync(userId, viewerId, ct);
        if (blocked)
            return Result<UserProfileDto>.Failure(ErrorCodes.Forbidden, "You cannot view this profile.");

        var followers = await _follows.CountFollowersAsync(userId, ct);
        var following = await _follows.CountFollowingAsync(userId, ct);
        var isFollowing = await _follows.ExistsAsync(viewerId, userId, ct);

        var dto = new UserProfileDto(
            user.UserId,
            user.Username,
            user.FullName,
            user.AvatarUrl,
            user.CoverUrl,
            user.Bio,
            user.Department,
            user.Major,
            user.ClassName,
            user.EnrollmentYear,
            user.Status,
            followers,
            following,
            isFollowing
        );

        return Result<UserProfileDto>.Success(dto);
    }

    public async Task<Result<UserSettingsDto>> GetSettingsAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result<UserSettingsDto>.Failure(ErrorCodes.NotFound, "User not found.");

        var s = await _settings.GetByUserIdAsync(userId, ct);
        if (s is null)
            return Result<UserSettingsDto>.Failure(ErrorCodes.NotFound, "Settings not found.");

        return Result<UserSettingsDto>.Success(ToDto(s));
    }

    public async Task<Result<UserSettingsDto>> UpdateSettingsAsync(Guid userId, UpdateUserSettingsRequest req, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result<UserSettingsDto>.Failure(ErrorCodes.NotFound, "User not found.");

        try
        {
            user.Settings.Update(req.PrivacyLevel, req.AllowDM, req.NotifyPrefsJson);
            await _uow.SaveChangesAsync(ct);
            return Result<UserSettingsDto>.Success(ToDto(user.Settings));
        }
        catch (Exception ex)
        {
            return Result<UserSettingsDto>.Failure(ErrorCodes.Validation, ex.Message);
        }
    }

    public async Task<Result<IReadOnlyList<UserLinkDto>>> GetLinksAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result<IReadOnlyList<UserLinkDto>>.Failure(ErrorCodes.NotFound, "User not found.");

        var list = await _links.ListByUserIdAsync(userId, ct);
        return Result<IReadOnlyList<UserLinkDto>>.Success(list.Select(ToDto).ToList());
    }

    public async Task<Result<UserLinkDto>> AddLinkAsync(Guid userId, AddUserLinkRequest req, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result<UserLinkDto>.Failure(ErrorCodes.NotFound, "User not found.");

        try
        {
            var link = user.AddLink(Guid.NewGuid(), req.Type, req.Url);
            await _uow.SaveChangesAsync(ct);
            return Result<UserLinkDto>.Success(ToDto(link));
        }
        catch (Exception ex)
        {
            return Result<UserLinkDto>.Failure(ErrorCodes.Validation, ex.Message);
        }
    }

    public async Task<Result> RemoveLinkAsync(Guid userId, Guid linkId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null)
            return Result.Failure(ErrorCodes.NotFound, "User not found.");

        user.RemoveLink(linkId);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> FollowAsync(Guid actorUserId, Guid targetUserId, CancellationToken ct = default)
    {
        if (actorUserId == targetUserId)
            return Result.Failure(ErrorCodes.Validation, "Cannot follow self.");

        if (await _blocks.IsBlockedBetweenAsync(actorUserId, targetUserId, ct))
            return Result.Failure(ErrorCodes.Forbidden, "Blocked.");

        var actor = await _users.GetByIdAsync(actorUserId, ct);
        var target = await _users.GetByIdAsync(targetUserId, ct);

        if (actor is null || target is null)
            return Result.Failure(ErrorCodes.NotFound, "User not found.");

        if (actor.Status != UserStatus.Active || target.Status != UserStatus.Active)
            return Result.Failure(ErrorCodes.Forbidden, "Inactive user.");

        if (await _follows.ExistsAsync(actorUserId, targetUserId, ct))
            return Result.Success();

        await _follows.AddAsync(actorUserId, targetUserId, ct);

        await _integrationEvents.WriteAsync(
            aggregateId: actorUserId,
            eventType: "UserFollowedEvent",
            payload: new
            {
                actorUserId,
                targetUserId,
                actorName = actor.FullName,
                targetName = target.FullName
            },
            ct: ct);

        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> UnfollowAsync(Guid actorUserId, Guid targetUserId, CancellationToken ct = default)
    {
        await _follows.RemoveAsync(actorUserId, targetUserId, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<FriendRequestDto>> SendFriendRequestAsync(Guid actorUserId, Guid toUserId, SendFriendRequestRequest req, CancellationToken ct = default)
    {
        if (actorUserId == toUserId)
            return Result<FriendRequestDto>.Failure(ErrorCodes.Validation, "Cannot friend self.");

        if (await _blocks.IsBlockedBetweenAsync(actorUserId, toUserId, ct))
            return Result<FriendRequestDto>.Failure(ErrorCodes.Forbidden, "Blocked.");

        var from = await _users.GetByIdAsync(actorUserId, ct);
        var to = await _users.GetByIdAsync(toUserId, ct);

        if (from is null || to is null)
            return Result<FriendRequestDto>.Failure(ErrorCodes.NotFound, "User not found.");

        var existing = await _friendRequests.GetActiveAsync(actorUserId, toUserId, ct);
        if (existing is not null)
            return Result<FriendRequestDto>.Failure(ErrorCodes.Conflict, "An active friend request already exists.");

        var fr = new DomainFriendRequest(Guid.NewGuid(), actorUserId, toUserId, req.Message);
        await _friendRequests.AddAsync(fr, ct);

        await _integrationEvents.WriteAsync(
            aggregateId: fr.RequestId,
            eventType: "FriendRequestSentEvent",
            payload: new
            {
                requestId = fr.RequestId,
                fromUserId = actorUserId,
                toUserId = toUserId,
                senderName = from.FullName,
                receiverEmail = to.TDMUEmail?.Value,
                message = req.Message,
                createdAt = fr.CreatedAt
            },
            ct: ct);

        await _uow.SaveChangesAsync(ct);
        return Result<FriendRequestDto>.Success(ToDto(fr));
    }

    public async Task<Result> AcceptFriendRequestAsync(Guid actorUserId, Guid requestId, CancellationToken ct = default)
    {
        var fr = await _friendRequests.GetByIdAsync(requestId, ct);
        if (fr is null)
            return Result.Failure(ErrorCodes.NotFound, "Friend request not found.");

        if (fr.ToUserId != actorUserId)
            return Result.Failure(ErrorCodes.Forbidden, "Not allowed.");

        if (await _blocks.IsBlockedBetweenAsync(fr.FromUserId, fr.ToUserId, ct))
            return Result.Failure(ErrorCodes.Forbidden, "Blocked.");

        try
        {
            fr.Accept();

            var a = fr.FromUserId;
            var b = fr.ToUserId;

            var aFollowB = await _follows.ExistsAsync(a, b, ct);
            var bFollowA = await _follows.ExistsAsync(b, a, ct);

            if (!aFollowB) await _follows.AddAsync(a, b, ct);
            if (!bFollowA) await _follows.AddAsync(b, a, ct);

            var from = await _users.GetByIdAsync(fr.FromUserId, ct);
            var to = await _users.GetByIdAsync(fr.ToUserId, ct);

            await _integrationEvents.WriteAsync(
                aggregateId: fr.RequestId,
                eventType: "FriendRequestAcceptedEvent",
                payload: new
                {
                    requestId = fr.RequestId,
                    fromUserId = fr.FromUserId,
                    toUserId = fr.ToUserId,
                    senderName = from?.FullName,
                    receiverName = to?.FullName,
                    acceptedAt = DateTime.UtcNow
                },
                ct: ct);

            await _uow.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ErrorCodes.Validation, ex.Message);
        }
    }

    public async Task<Result> RejectFriendRequestAsync(Guid actorUserId, Guid requestId, CancellationToken ct = default)
    {
        var fr = await _friendRequests.GetByIdAsync(requestId, ct);
        if (fr is null)
            return Result.Failure(ErrorCodes.NotFound, "Friend request not found.");

        if (fr.ToUserId != actorUserId)
            return Result.Failure(ErrorCodes.Forbidden, "Not allowed.");

        try
        {
            fr.Reject();
            await _uow.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ErrorCodes.Validation, ex.Message);
        }
    }

    public async Task<Result> CancelFriendRequestAsync(Guid actorUserId, Guid requestId, CancellationToken ct = default)
    {
        var fr = await _friendRequests.GetByIdAsync(requestId, ct);
        if (fr is null)
            return Result.Failure(ErrorCodes.NotFound, "Friend request not found.");

        if (fr.FromUserId != actorUserId)
            return Result.Failure(ErrorCodes.Forbidden, "Not allowed.");

        try
        {
            fr.Cancel();
            await _uow.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ErrorCodes.Validation, ex.Message);
        }
    }

    public async Task<Result> BlockAsync(Guid actorUserId, Guid blockedUserId, CancellationToken ct = default)
    {
        if (actorUserId == blockedUserId)
            return Result.Failure(ErrorCodes.Validation, "Cannot block self.");

        var a = await _users.GetByIdAsync(actorUserId, ct);
        var b = await _users.GetByIdAsync(blockedUserId, ct);

        if (a is null || b is null)
            return Result.Failure(ErrorCodes.NotFound, "User not found.");

        if (await _blocks.ExistsAsync(actorUserId, blockedUserId, ct))
            return Result.Success();

        await _blocks.AddAsync(actorUserId, blockedUserId, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> UnblockAsync(Guid actorUserId, Guid blockedUserId, CancellationToken ct = default)
    {
        await _blocks.RemoveAsync(actorUserId, blockedUserId, ct);
        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result<PagedResult<UserLiteDto>>> ListFriendsAsync(Guid actorUserId, int page, int pageSize, CancellationToken ct)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize is <= 0 or > 100 ? 20 : pageSize;

        var actor = await _users.GetByIdAsync(actorUserId, ct);
        if (actor is null)
            return Result<PagedResult<UserLiteDto>>.Failure(ErrorCodes.NotFound, "User not found.");

        var followingIds = await _follows.ListFollowingIdsAsync(actorUserId, ct);
        var followerIds = await _follows.ListFollowerIdsAsync(actorUserId, ct);

        var friendsIds = followingIds.Intersect(followerIds).ToList();
        var total = friendsIds.Count;

        var pagedIds = friendsIds
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var users = new List<UserLiteDto>(pagedIds.Count);
        foreach (var id in pagedIds)
        {
            var u = await _users.GetByIdAsync(id, ct);
            if (u is null) continue;
            if (u.Status != UserStatus.Active) continue;

            users.Add(new UserLiteDto
            {
                UserId = u.UserId,
                Username = u.Username,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                ClassName = u.ClassName,
                Major = u.Major
            });
        }

        return Result<PagedResult<UserLiteDto>>.Success(new PagedResult<UserLiteDto>
        {
            Items = users,
            Page = page,
            PageSize = pageSize,
            Total = total
        });
    }

    public Task<Result<List<UserLiteDto>>> ListFriendSuggestionsAsync(Guid actorUserId, int limit, CancellationToken ct)
    {
        return Task.FromResult(Result<List<UserLiteDto>>.Success(new List<UserLiteDto>()));
    }

    public async Task<Result<List<UserLiteDto>>> ListAllUsersAsync(CancellationToken ct)
    {
        var users = await _users.ListAllAsync(ct);

        var result = users
            .Where(u => u.Status == UserStatus.Active)
            .Select(u => new UserLiteDto
            {
                UserId = u.UserId,
                Username = u.Username,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                ClassName = u.ClassName,
                Major = u.Major
            })
            .ToList();

        return Result<List<UserLiteDto>>.Success(result);
    }

    public async Task<Result<PagedResult<FriendRequestDto>>> ListIncomingFriendRequestsAsync(
        Guid actorUserId, int page, int pageSize, CancellationToken ct = default)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        var actor = await _users.GetByIdAsync(actorUserId, ct);
        if (actor is null)
            return Result<PagedResult<FriendRequestDto>>.Failure(ErrorCodes.NotFound, "User not found.");

        var (items, total) = await _friendRequests.ListIncomingAsync(actorUserId, page, pageSize, ct);

        var filtered = new List<DomainFriendRequest>(items.Count);
        foreach (var fr in items)
        {
            var blocked = await _blocks.IsBlockedBetweenAsync(fr.FromUserId, fr.ToUserId, ct);
            if (!blocked) filtered.Add(fr);
        }

        var dtoItems = filtered.Select(ToDto).ToList();

        var result = new PagedResult<FriendRequestDto>
        {
            Items = dtoItems,
            Page = page,
            PageSize = pageSize,
            Total = total
        };

        return Result<PagedResult<FriendRequestDto>>.Success(result);
    }

    public async Task<Result<PagedResult<FriendRequestDto>>> ListOutgoingFriendRequestsAsync(
        Guid actorUserId, int page, int pageSize, CancellationToken ct = default)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        var actor = await _users.GetByIdAsync(actorUserId, ct);
        if (actor is null)
            return Result<PagedResult<FriendRequestDto>>.Failure(ErrorCodes.NotFound, "User not found.");

        var (items, total) = await _friendRequests.ListOutgoingAsync(actorUserId, page, pageSize, ct);

        var filtered = new List<DomainFriendRequest>(items.Count);
        foreach (var fr in items)
        {
            var blocked = await _blocks.IsBlockedBetweenAsync(fr.FromUserId, fr.ToUserId, ct);
            if (!blocked) filtered.Add(fr);
        }

        var dtoItems = filtered.Select(ToDto).ToList();

        var result = new PagedResult<FriendRequestDto>
        {
            Items = dtoItems,
            Page = page,
            PageSize = pageSize,
            Total = total
        };

        return Result<PagedResult<FriendRequestDto>>.Success(result);
    }

    private static UserDto ToDto(DomainUser u) => new(
        u.UserId,
        u.StudentCode.Value,
        u.Username,
        u.FullName,
        u.TDMUEmail?.Value,
        u.Department,
        u.Major,
        u.ClassName,
        u.EnrollmentYear,
        u.AvatarUrl,
        u.CoverUrl,
        u.Bio,
        u.Status,
        u.CreatedAt,
        u.UpdatedAt
    );

    private static UserSettingsDto ToDto(DomainUserSettings s) =>
        new(s.UserId, s.PrivacyLevel, s.AllowDM, s.NotifyPrefsJson, s.UpdatedAt);

    private static UserLinkDto ToDto(DomainUserLink l) =>
        new(l.LinkId, l.UserId, l.Type, l.Url, l.CreatedAt);

    private static FriendRequestDto ToDto(DomainFriendRequest fr) => new(
        fr.RequestId,
        fr.FromUserId,
        fr.ToUserId,
        (byte)fr.Status,
        fr.IsActive,
        fr.Message,
        fr.CreatedAt,
        fr.RespondedAt
    );
}