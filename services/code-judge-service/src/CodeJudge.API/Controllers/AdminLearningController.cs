using CodeJudge.Domain.Enums;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/admin/learning")]
public sealed class AdminLearningController : ControllerBase
{
    private readonly JudgeDbContext _db;

    public AdminLearningController(JudgeDbContext db)
    {
        _db = db;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var since7d = now.AddDays(-7);

        var totalLearners = await _db.UserXp.AsNoTracking().Select(x => x.UserId).Distinct().CountAsync(ct);
        var totalPaths = await _db.LearningPaths.AsNoTracking().CountAsync(ct);
        var publicPaths = await _db.LearningPaths.AsNoTracking().CountAsync(x => x.IsPublic && x.Status == 1, ct);
        var totalLessons = await _db.Lessons.AsNoTracking().CountAsync(ct);
        var publishedLessons = await _db.Lessons.AsNoTracking().CountAsync(x => x.IsPublished, ct);
        var totalLessonItems = await _db.LessonItems.AsNoTracking().CountAsync(ct);
        var totalQuizzes = await _db.Quizzes.AsNoTracking().CountAsync(ct);
        var publishedQuizzes = await _db.Quizzes.AsNoTracking().CountAsync(x => x.IsPublished, ct);
        var totalBadges = await _db.Badges.AsNoTracking().CountAsync(ct);
        var totalChallenges = await _db.DailyChallenges.AsNoTracking().CountAsync(ct);
        var activeChallenges = await _db.DailyChallenges.AsNoTracking().CountAsync(x => x.IsActive && x.StartsAt <= now && x.EndsAt >= now, ct);
        var totalSubmissions = await _db.Submissions.AsNoTracking().CountAsync(ct);
        var recentSubmissions = await _db.Submissions.AsNoTracking().CountAsync(x => x.SubmittedAt >= since7d, ct);
        var acceptedSubmissions = await _db.Submissions.AsNoTracking().CountAsync(x => x.Status == SubmissionStatus.AC, ct);
        var queuedOrRunning = await _db.Submissions.AsNoTracking().CountAsync(x => x.Status == SubmissionStatus.Queued || x.Status == SubmissionStatus.Running, ct);
        var totalQuizAttempts = await _db.QuizAttempts.AsNoTracking().CountAsync(ct);
        var recentQuizAttempts = await _db.QuizAttempts.AsNoTracking().CountAsync(x => x.StartedAt >= since7d, ct);
        var averageQuizScore = await _db.QuizAttempts.AsNoTracking().AverageAsync(x => (decimal?)x.Score, ct);
        var totalXpGranted = await _db.UserXp.AsNoTracking().SumAsync(x => (int?)x.XpDelta, ct);
        var awardedBadges = await _db.UserBadges.AsNoTracking().CountAsync(ct);
        var completedChallenges = await _db.UserChallengeProgress.AsNoTracking().CountAsync(x => x.CompletedAt != null || x.Status == "completed", ct);

        return Ok(new
        {
            catalog = new
            {
                totalPaths,
                publicPaths,
                totalLessons,
                publishedLessons,
                totalLessonItems,
                totalQuizzes,
                publishedQuizzes,
                totalBadges,
                totalChallenges,
                activeChallenges
            },
            activity = new
            {
                totalLearners,
                totalSubmissions,
                recentSubmissions7d = recentSubmissions,
                acceptedSubmissions,
                queuedOrRunningSubmissions = queuedOrRunning,
                totalQuizAttempts,
                recentQuizAttempts7d = recentQuizAttempts,
                averageQuizScore = Math.Round(averageQuizScore ?? 0m, 2),
                totalXpGranted = totalXpGranted ?? 0,
                awardedBadges,
                completedChallenges
            }
        });
    }

    [HttpGet("paths")]
    public async Task<IActionResult> Paths([FromQuery] string? keyword, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var normalizedPage = page <= 0 ? 1 : page;
        var normalizedPageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);

        var query = _db.LearningPaths.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var value = keyword.Trim();
            query = query.Where(x => x.Title.Contains(value) || (x.Slug != null && x.Slug.Contains(value)) || (x.Description != null && x.Description.Contains(value)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .Select(x => new
            {
                x.PathId,
                x.Title,
                x.Slug,
                x.Description,
                x.Status,
                x.IsPublic,
                x.SortOrder,
                x.MinimumXpRequired,
                x.TotalXpReward,
                x.EstimatedMinutes,
                x.CreatedAt,
                x.UpdatedAt
            })
            .ToListAsync(ct);

        var pathIds = items.Select(x => x.PathId).ToList();
        var lessonCounts = pathIds.Count == 0
            ? new Dictionary<Guid, int>()
            : await _db.Lessons.AsNoTracking()
                .Where(x => pathIds.Contains(x.PathId))
                .GroupBy(x => x.PathId)
                .Select(x => new { x.Key, Count = x.Count(), Published = x.Count(y => y.IsPublished) })
                .ToDictionaryAsync(x => x.Key, x => x.Count, ct);
        var publishedLessonCounts = pathIds.Count == 0
            ? new Dictionary<Guid, int>()
            : await _db.Lessons.AsNoTracking()
                .Where(x => pathIds.Contains(x.PathId) && x.IsPublished)
                .GroupBy(x => x.PathId)
                .Select(x => new { x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count, ct);

        return Ok(new
        {
            items = items.Select(x => new
            {
                pathId = x.PathId,
                title = x.Title,
                slug = x.Slug,
                description = x.Description,
                status = x.Status,
                isPublic = x.IsPublic,
                sortOrder = x.SortOrder,
                minimumXpRequired = x.MinimumXpRequired,
                totalXpReward = x.TotalXpReward,
                estimatedMinutes = x.EstimatedMinutes,
                lessonCount = lessonCounts.GetValueOrDefault(x.PathId, 0),
                publishedLessonCount = publishedLessonCounts.GetValueOrDefault(x.PathId, 0),
                createdAt = x.CreatedAt,
                updatedAt = x.UpdatedAt
            }),
            total,
            page = normalizedPage,
            pageSize = normalizedPageSize
        });
    }

    [HttpGet("lessons")]
    public async Task<IActionResult> Lessons([FromQuery] Guid? pathId, [FromQuery] string? keyword, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var normalizedPage = page <= 0 ? 1 : page;
        var normalizedPageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);

        var query = _db.Lessons.AsNoTracking().AsQueryable();
        if (pathId.HasValue) query = query.Where(x => x.PathId == pathId.Value);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var value = keyword.Trim();
            query = query.Where(x => x.Title.Contains(value) || (x.Slug != null && x.Slug.Contains(value)) || (x.Summary != null && x.Summary.Contains(value)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .Select(x => new
            {
                x.LessonId,
                x.PathId,
                x.Title,
                x.Slug,
                x.Summary,
                x.LessonType,
                x.IsPublished,
                x.EstimatedMinutes,
                x.XpReward,
                x.PointsReward,
                x.SortOrder,
                x.CreatedAt,
                x.UpdatedAt
            })
            .ToListAsync(ct);

        var lessonIds = items.Select(x => x.LessonId).ToList();
        var itemCounts = lessonIds.Count == 0
            ? new Dictionary<Guid, int>()
            : await _db.LessonItems.AsNoTracking()
                .Where(x => lessonIds.Contains(x.LessonId))
                .GroupBy(x => x.LessonId)
                .Select(x => new { x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count, ct);

        return Ok(new
        {
            items = items.Select(x => new
            {
                lessonId = x.LessonId,
                pathId = x.PathId,
                title = x.Title,
                slug = x.Slug,
                summary = x.Summary,
                lessonType = x.LessonType,
                isPublished = x.IsPublished,
                estimatedMinutes = x.EstimatedMinutes,
                xpReward = x.XpReward,
                pointsReward = x.PointsReward,
                sortOrder = x.SortOrder,
                itemCount = itemCounts.GetValueOrDefault(x.LessonId, 0),
                createdAt = x.CreatedAt,
                updatedAt = x.UpdatedAt
            }),
            total,
            page = normalizedPage,
            pageSize = normalizedPageSize
        });
    }

    [HttpGet("quizzes")]
    public async Task<IActionResult> Quizzes([FromQuery] Guid? lessonId, [FromQuery] string? keyword, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var normalizedPage = page <= 0 ? 1 : page;
        var normalizedPageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);

        var query = _db.Quizzes.AsNoTracking().AsQueryable();
        if (lessonId.HasValue) query = query.Where(x => x.LessonId == lessonId.Value);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var value = keyword.Trim();
            query = query.Where(x => x.Title.Contains(value) || (x.Description != null && x.Description.Contains(value)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .Select(x => new
            {
                x.QuizId,
                x.LessonId,
                x.PathId,
                x.Title,
                x.QuizType,
                x.PassingScore,
                x.MaxAttempts,
                x.IsPublished,
                x.EstimatedMinutes,
                x.XpReward,
                x.CreatedAt,
                x.UpdatedAt
            })
            .ToListAsync(ct);

        var quizIds = items.Select(x => x.QuizId).ToList();
        var questionCounts = quizIds.Count == 0
            ? new Dictionary<Guid, int>()
            : await _db.QuizQuestions.AsNoTracking()
                .Where(x => quizIds.Contains(x.QuizId))
                .GroupBy(x => x.QuizId)
                .Select(x => new { x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count, ct);

        return Ok(new
        {
            items = items.Select(x => new
            {
                quizId = x.QuizId,
                lessonId = x.LessonId,
                pathId = x.PathId,
                title = x.Title,
                quizType = x.QuizType,
                passingScore = x.PassingScore,
                maxAttempts = x.MaxAttempts,
                isPublished = x.IsPublished,
                estimatedMinutes = x.EstimatedMinutes,
                xpReward = x.XpReward,
                questionCount = questionCounts.GetValueOrDefault(x.QuizId, 0),
                createdAt = x.CreatedAt,
                updatedAt = x.UpdatedAt
            }),
            total,
            page = normalizedPage,
            pageSize = normalizedPageSize
        });
    }

    [HttpGet("challenges")]
    public async Task<IActionResult> Challenges([FromQuery] bool? activeOnly, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var normalizedPage = page <= 0 ? 1 : page;
        var normalizedPageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);
        var now = DateTime.UtcNow;

        var query = _db.DailyChallenges.AsNoTracking().AsQueryable();
        if (activeOnly == true) query = query.Where(x => x.IsActive && x.StartsAt <= now && x.EndsAt >= now);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.StartsAt)
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .Select(x => new
            {
                x.ChallengeId,
                x.Title,
                x.ChallengeType,
                x.TargetMetric,
                x.TargetValue,
                x.XpReward,
                x.PointsReward,
                x.IsActive,
                x.StartsAt,
                x.EndsAt,
                x.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(new { items, total, page = normalizedPage, pageSize = normalizedPageSize });
    }

    [HttpGet("badges")]
    public async Task<IActionResult> Badges([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var normalizedPage = page <= 0 ? 1 : page;
        var normalizedPageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);

        var total = await _db.Badges.AsNoTracking().CountAsync(ct);
        var items = await _db.Badges.AsNoTracking()
            .OrderBy(x => x.Name)
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(ct);

        var badgeIds = items.Select(x => x.BadgeId).ToList();
        var awardCounts = badgeIds.Count == 0
            ? new Dictionary<Guid, int>()
            : await _db.UserBadges.AsNoTracking()
                .Where(x => badgeIds.Contains(x.BadgeId))
                .GroupBy(x => x.BadgeId)
                .Select(x => new { x.Key, Count = x.Count() })
                .ToDictionaryAsync(x => x.Key, x => x.Count, ct);

        return Ok(new
        {
            items = items.Select(x => new
            {
                badgeId = x.BadgeId,
                code = x.Code,
                name = x.Name,
                description = x.Description,
                iconUrl = x.IconUrl,
                colorHex = x.ColorHex,
                awardCount = awardCounts.GetValueOrDefault(x.BadgeId, 0)
            }),
            total,
            page = normalizedPage,
            pageSize = normalizedPageSize
        });
    }
}
