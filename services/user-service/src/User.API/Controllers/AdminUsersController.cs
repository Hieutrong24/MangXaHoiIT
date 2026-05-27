using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using User.API.Extensions;
using User.Domain.Enums;
using User.Infrastructure.Outbox;
using User.Infrastructure.Persistence;

namespace User.API.Controllers;

[ApiController]
[Route("api/admin/users")]
public sealed class AdminUsersController : ControllerBase
{
    private readonly UserDbContext _db;

    public AdminUsersController(UserDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> ListUsers(
        [FromQuery] string? keyword,
        [FromQuery] byte? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);
        var normalizedKeyword = string.IsNullOrWhiteSpace(keyword) ? null : keyword.Trim();

        var usersQuery = _db.Users
            .AsNoTracking()
            .AsQueryable();

        if (status.HasValue && Enum.IsDefined(typeof(UserStatus), status.Value))
        {
            var parsedStatus = (UserStatus)status.Value;
            usersQuery = usersQuery.Where(x => x.Status == parsedStatus);
        }

        List<AdminUserListItem> items;
        int total;

        if (normalizedKeyword is null)
        {
            total = await usersQuery.CountAsync(ct);

            var pageEntities = await usersQuery
                .OrderByDescending(x => x.UpdatedAt)
                .ThenByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            items = pageEntities
                .Select(MapAdminUserListItem)
                .ToList();
        }
        else
        {
            var candidates = await usersQuery
                .OrderByDescending(x => x.UpdatedAt)
                .ThenByDescending(x => x.CreatedAt)
                .ToListAsync(ct);

            var filtered = candidates
                .Where(x => ContainsKeyword(x, normalizedKeyword))
                .ToList();

            total = filtered.Count;
            items = filtered
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(MapAdminUserListItem)
                .ToList();
        }

        return Ok(new
        {
            items,
            total,
            page,
            pageSize
        });
    }

    private static bool ContainsKeyword(User.Domain.Entities.User user, string keyword)
    {
        return Contains(user.Username, keyword)
            || Contains(user.FullName, keyword)
            || Contains(user.StudentCode.Value, keyword)
            || Contains(user.TDMUEmail.HasValue ? user.TDMUEmail.Value.Value : null, keyword)
            || Contains(user.Department, keyword)
            || Contains(user.Major, keyword)
            || Contains(user.ClassName, keyword);
    }

    private static bool Contains(string? source, string keyword)
        => !string.IsNullOrEmpty(source)
           && source.Contains(keyword, StringComparison.OrdinalIgnoreCase);

    private static AdminUserListItem MapAdminUserListItem(User.Domain.Entities.User user)
        => new(
            user.UserId,
            user.StudentCode.Value,
            user.Username,
            user.FullName,
            user.TDMUEmail.HasValue ? user.TDMUEmail.Value.Value : null,
            user.Department,
            user.Major,
            user.ClassName,
            user.EnrollmentYear,
            user.AvatarUrl,
            user.Bio,
            (byte)user.Status,
            user.CreatedAt,
            user.UpdatedAt);



    private sealed record AdminUserListItem(
        Guid UserId,
        string StudentCode,
        string Username,
        string FullName,
        string? TDMUEmail,
        string? Department,
        string? Major,
        string? ClassName,
        short? EnrollmentYear,
        string? AvatarUrl,
        string? Bio,
        byte Status,
        DateTime CreatedAt,
        DateTime UpdatedAt);

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetUser(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(x => x.Settings)
            .Include(x => x.Links)
            .FirstOrDefaultAsync(x => x.UserId == userId, ct);

        if (user is null)
            return NotFound(new { code = "not_found", message = "User not found." });

        return Ok(new
        {
            user.UserId,
            StudentCode = user.StudentCode.Value,
            user.Username,
            user.FullName,
            TDMUEmail = user.TDMUEmail.HasValue ? user.TDMUEmail.Value.Value : (string?)null,
            user.Department,
            user.Major,
            user.ClassName,
            user.EnrollmentYear,
            user.AvatarUrl,
            user.CoverUrl,
            user.Bio,
            Status = (byte)user.Status,
            user.CreatedAt,
            user.UpdatedAt,
            settings = user.Settings == null ? null : new
            {
                user.Settings.UserId,
                user.Settings.PrivacyLevel,
                user.Settings.AllowDM,
                user.Settings.NotifyPrefsJson,
                user.Settings.UpdatedAt
            },
            links = user.Links
                .OrderBy(x => x.CreatedAt)
                .Select(x => new
                {
                    x.LinkId,
                    x.Type,
                    x.Url,
                    x.CreatedAt
                })
                .ToList()
        });
    }

    [HttpPatch("{userId:guid}/lock")]
    public Task<IActionResult> LockUser(Guid userId, CancellationToken ct = default)
        => UpdateStatus(userId, UserStatus.Blocked, "UserLockedEvent", ct);

    [HttpPatch("{userId:guid}/unlock")]
    public Task<IActionResult> UnlockUser(Guid userId, CancellationToken ct = default)
        => UpdateStatus(userId, UserStatus.Active, "UserUnlockedEvent", ct);

    [HttpDelete("{userId:guid}")]
    public Task<IActionResult> DeleteUser(Guid userId, CancellationToken ct = default)
        => UpdateStatus(userId, UserStatus.Deleted, "UserDeletedEvent", ct);

    [HttpGet("activity-logs")]
    public async Task<IActionResult> ListActivityLogs(
        [FromQuery] Guid? userId,
        [FromQuery] string? action,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 50 : Math.Min(pageSize, 200);

        var query = _db.UserOutboxEvents.AsNoTracking().AsQueryable();

        if (userId.HasValue)
        {
            var uid = userId.Value;
            var uidText = uid.ToString();
            query = query.Where(x => x.AggregateId == uid || EF.Functions.Like(x.PayloadJson, $"%{uidText}%"));
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            var normalizedAction = action.Trim();
            query = query.Where(x => x.EventType.Contains(normalizedAction));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.OccurredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.EventId,
                x.AggregateId,
                x.EventType,
                x.PayloadJson,
                x.OccurredAt,
                x.ProcessedAt,
                x.TraceId
            })
            .ToListAsync(ct);

        return Ok(new
        {
            items,
            total,
            page,
            pageSize
        });
    }

    [HttpGet("activity-dashboard")]
    public async Task<IActionResult> GetActivityDashboard(CancellationToken ct = default)
    {
        var usersQuery = _db.Users.AsNoTracking();
        var outboxQuery = _db.UserOutboxEvents.AsNoTracking();

        var totalUsers = await usersQuery.CountAsync(ct);
        var activeUsers = await usersQuery.CountAsync(x => x.Status == UserStatus.Active, ct);
        var blockedUsers = await usersQuery.CountAsync(x => x.Status == UserStatus.Blocked, ct);
        var deletedUsers = await usersQuery.CountAsync(x => x.Status == UserStatus.Deleted, ct);

        var now = DateTime.UtcNow;
        var last7Days = now.AddDays(-7);
        var last30Days = now.AddDays(-30);

        var activityLast7Days = await outboxQuery.CountAsync(x => x.OccurredAt >= last7Days, ct);
        var activityLast30Days = await outboxQuery.CountAsync(x => x.OccurredAt >= last30Days, ct);

        var topActions = await outboxQuery
            .GroupBy(x => x.EventType)
            .Select(g => new
            {
                action = g.Key,
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .Take(10)
            .ToListAsync(ct);

        var recentActivities = await outboxQuery
            .OrderByDescending(x => x.OccurredAt)
            .Take(10)
            .Select(x => new
            {
                x.EventId,
                x.AggregateId,
                x.EventType,
                x.OccurredAt,
                x.TraceId
            })
            .ToListAsync(ct);

        return Ok(new
        {
            totals = new
            {
                users = totalUsers,
                activeUsers,
                blockedUsers,
                deletedUsers,
                activityLast7Days,
                activityLast30Days
            },
            topActions,
            recentActivities
        });
    }

    private async Task<IActionResult> UpdateStatus(Guid userId, UserStatus status, string eventType, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (user is null)
            return NotFound(new { code = "not_found", message = "User not found." });

        user.SetStatus(status);

        _db.UserOutboxEvents.Add(new UserOutboxEvent
        {
            EventId = Guid.NewGuid(),
            AggregateId = user.UserId,
            EventType = eventType,
            PayloadJson = $"{{\"userId\":\"{user.UserId}\",\"status\":{(byte)status},\"actorUserId\":\"{HttpContext.GetActorUserId()}\"}}",
            OccurredAt = DateTime.UtcNow,
            TraceId = HttpContext.TraceIdentifier
        });

        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            ok = true,
            userId = user.UserId,
            status = (byte)user.Status,
            updatedAt = user.UpdatedAt
        });
    }
}
