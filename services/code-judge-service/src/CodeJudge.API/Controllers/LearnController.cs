using CodeJudge.Application.Interfaces;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/learn")]
public sealed class LearnController : ControllerBase
{
    private readonly JudgeDbContext _db;
    private readonly ILearningProgressService _learningProgressService;

    public LearnController(JudgeDbContext db, ILearningProgressService learningProgressService)
    {
        _db = db;
        _learningProgressService = learningProgressService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard([FromQuery] string? userId, CancellationToken ct)
    {
        var currentUserId = ParseUserId(userId);
        var now = DateTime.UtcNow;

        var paths = await _db.LearningPaths.AsNoTracking()
            .Where(x => x.IsPublic && x.Status == 1)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(ct);

        var pathIds = paths.Select(x => x.PathId).ToList();
        var prerequisites = pathIds.Count == 0
            ? new List<PathPrerequisite>()
            : await _db.PathPrerequisites.AsNoTracking().Where(x => pathIds.Contains(x.PathId)).OrderBy(x => x.SortOrder).ToListAsync(ct);

        var lessons = pathIds.Count == 0
            ? new List<Lesson>()
            : await _db.Lessons.AsNoTracking().Where(x => pathIds.Contains(x.PathId) && x.IsPublished).OrderBy(x => x.SortOrder).ToListAsync(ct);

        var lessonIds = lessons.Select(x => x.LessonId).ToList();
        var lessonStateMap = currentUserId.HasValue && lessonIds.Count > 0
            ? await _db.UserLessonStates.AsNoTracking().Where(x => x.UserId == currentUserId.Value && lessonIds.Contains(x.LessonId)).ToDictionaryAsync(x => x.LessonId, x => x, ct)
            : new Dictionary<Guid, UserLessonState>();

        var pathStateMap = currentUserId.HasValue && pathIds.Count > 0
            ? await _db.UserPathStates.AsNoTracking().Where(x => x.UserId == currentUserId.Value && pathIds.Contains(x.PathId)).ToDictionaryAsync(x => x.PathId, x => x, ct)
            : new Dictionary<Guid, UserPathState>();

        var totalXp = currentUserId.HasValue
            ? await _db.UserXp.AsNoTracking().Where(x => x.UserId == currentUserId.Value).SumAsync(x => (int?)x.XpDelta, ct) ?? 0
            : 0;

        var streak = currentUserId.HasValue
            ? await _db.UserStreaks.AsNoTracking().Where(x => x.UserId == currentUserId.Value).Select(x => x.CurrentStreakDays).FirstOrDefaultAsync(ct)
            : 0;

        if (streak <= 0 && currentUserId.HasValue)
        {
            var xpDates = await _db.UserXp.AsNoTracking().Where(x => x.UserId == currentUserId.Value).Select(x => x.CreatedAt.Date).Distinct().OrderByDescending(x => x).ToListAsync(ct);
            streak = ComputeCurrentStreak(xpDates);
        }

        var completedLessons = lessonStateMap.Values.Count(x => IsCompleted(x.Status, x.CompletedAt));
        var completedProblems = currentUserId.HasValue
            ? await _db.UserProblemStats.AsNoTracking().CountAsync(x => x.UserId == currentUserId.Value && (x.FirstAcceptedAt != null || x.BestStatus == (byte)SubmissionStatus.AC), ct)
            : 0;

        var badges = currentUserId.HasValue
            ? await (from ub in _db.UserBadges.AsNoTracking()
                     join b in _db.Badges.AsNoTracking() on ub.BadgeId equals b.BadgeId
                     where ub.UserId == currentUserId.Value
                     orderby ub.AwardedAt descending
                     select new BadgeVm(b.BadgeId, b.Code, b.Name, b.Description, b.IconUrl, b.ColorHex, ub.AwardedAt, true))
                     .Take(6)
                     .ToListAsync(ct)
            : new List<BadgeVm>();

        var currentChallengeRows = await _db.DailyChallenges.AsNoTracking()
            .Where(x => x.IsActive && x.StartsAt <= now && x.EndsAt >= now)
            .OrderBy(x => x.EndsAt)
            .Take(6)
            .ToListAsync(ct);

        var challengeIds = currentChallengeRows.Select(x => x.ChallengeId).ToList();
        var challengeProgressMap = currentUserId.HasValue && challengeIds.Count > 0
            ? await _db.UserChallengeProgress.AsNoTracking().Where(x => x.UserId == currentUserId.Value && challengeIds.Contains(x.ChallengeId)).ToDictionaryAsync(x => x.ChallengeId, x => x, ct)
            : new Dictionary<Guid, UserChallengeProgress>();

        var pathCards = BuildPathCards(paths, prerequisites, lessons, lessonStateMap, pathStateMap, totalXp);
        var totalLessons = lessons.Count;
        var progressPercent = totalLessons <= 0 ? 0m : Math.Round((decimal)completedLessons * 100m / totalLessons, 2);
        var level = Math.Max(1, (totalXp / 120) + 1);

        var dailyChallenges = currentChallengeRows.Select(ch =>
        {
            challengeProgressMap.TryGetValue(ch.ChallengeId, out var progress);
            var currentValue = progress?.CurrentValue ?? 0m;
            var targetValue = progress?.TargetValue ?? ch.TargetValue;
            var percent = targetValue <= 0 ? 0 : Math.Round(currentValue * 100m / targetValue, 2);
            var completed = string.Equals(progress?.Status, "completed", StringComparison.OrdinalIgnoreCase) || progress?.CompletedAt != null;
            return new
            {
                challengeId = ch.ChallengeId,
                title = ch.Title,
                description = ch.Description,
                rewardXp = ch.XpReward,
                progressPercent = percent,
                progressText = $"{currentValue}/{targetValue}",
                isCompleted = completed
            };
        }).ToList();

        return Ok(new
        {
            totalXp,
            level,
            currentStreak = streak,
            completedLessons,
            completedProblems,
            badgesCount = badges.Count,
            progressPercent,
            journey = pathCards,
            dailyChallenges,
            badges
        });
    }

    [HttpGet("paths")]
    public async Task<IActionResult> ListPaths([FromQuery] string? userId, CancellationToken ct)
    {
        var currentUserId = ParseUserId(userId);
        var paths = await _db.LearningPaths.AsNoTracking()
            .Where(x => x.IsPublic && x.Status == 1)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(ct);

        if (paths.Count == 0) return Ok(Array.Empty<object>());

        var pathIds = paths.Select(x => x.PathId).ToList();
        var prerequisites = await _db.PathPrerequisites.AsNoTracking().Where(x => pathIds.Contains(x.PathId)).OrderBy(x => x.SortOrder).ToListAsync(ct);
        var lessons = await _db.Lessons.AsNoTracking().Where(x => pathIds.Contains(x.PathId) && x.IsPublished).OrderBy(x => x.SortOrder).ToListAsync(ct);
        var lessonIds = lessons.Select(x => x.LessonId).ToList();
        var lessonStateMap = currentUserId.HasValue && lessonIds.Count > 0
            ? await _db.UserLessonStates.AsNoTracking().Where(x => x.UserId == currentUserId.Value && lessonIds.Contains(x.LessonId)).ToDictionaryAsync(x => x.LessonId, x => x, ct)
            : new Dictionary<Guid, UserLessonState>();
        var pathStateMap = currentUserId.HasValue
            ? await _db.UserPathStates.AsNoTracking().Where(x => x.UserId == currentUserId.Value && pathIds.Contains(x.PathId)).ToDictionaryAsync(x => x.PathId, x => x, ct)
            : new Dictionary<Guid, UserPathState>();
        var totalXp = currentUserId.HasValue ? await _db.UserXp.AsNoTracking().Where(x => x.UserId == currentUserId.Value).SumAsync(x => (int?)x.XpDelta, ct) ?? 0 : 0;

        var items = BuildPathCards(paths, prerequisites, lessons, lessonStateMap, pathStateMap, totalXp)
            .Select(x => new
            {
                x.pathId,
                x.title,
                x.slug,
                x.description,
                estimatedMinutes = x.estimatedMinutes,
                totalXpReward = x.totalXpReward,
                levelLabel = x.difficultyLabel,
                x.state,
                x.isUnlocked,
                x.progressPercent,
                x.lessonCount,
                x.completedLessonCount,
                x.minimumXpRequired,
                x.requirementSummary,
            });

        return Ok(items);
    }

    [HttpGet("paths/{slug}")]
    public async Task<IActionResult> GetPath(string slug, [FromQuery] string? userId, CancellationToken ct)
    {
        var currentUserId = ParseUserId(userId);
        var path = await _db.LearningPaths.AsNoTracking().FirstOrDefaultAsync(x => x.Slug == slug && x.IsPublic && x.Status == 1, ct);
        if (path is null) return NotFound();

        var lessons = await _db.Lessons.AsNoTracking()
            .Where(x => x.PathId == path.PathId && x.IsPublished)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var lessonIds = lessons.Select(x => x.LessonId).ToList();
        var items = lessonIds.Count == 0
            ? new List<LessonItem>()
            : await _db.LessonItems.AsNoTracking().Where(x => lessonIds.Contains(x.LessonId)).OrderBy(x => x.SortOrder).ToListAsync(ct);

        var lessonStates = currentUserId.HasValue && lessonIds.Count > 0
            ? await _db.UserLessonStates.AsNoTracking().Where(x => x.UserId == currentUserId.Value && lessonIds.Contains(x.LessonId)).ToDictionaryAsync(x => x.LessonId, x => x, ct)
            : new Dictionary<Guid, UserLessonState>();

        var prereqs = currentUserId.HasValue
            ? await _db.PathPrerequisites.AsNoTracking().Where(x => x.PathId == path.PathId).OrderBy(x => x.SortOrder).ToListAsync(ct)
            : new List<PathPrerequisite>();

        var requiredPathIds = prereqs.Select(x => x.RequiredPathId).Distinct().ToList();
        var requiredLessons = currentUserId.HasValue && requiredPathIds.Count > 0
            ? await _db.Lessons.AsNoTracking().Where(x => requiredPathIds.Contains(x.PathId) && x.IsPublished).ToListAsync(ct)
            : new List<Lesson>();
        var requiredLessonIds = requiredLessons.Select(x => x.LessonId).ToList();
        var allRelevantLessonIds = currentUserId.HasValue ? lessonIds.Concat(requiredLessonIds).Distinct().ToList() : lessonIds;
        var allLessonStates = currentUserId.HasValue && allRelevantLessonIds.Count > 0
            ? await _db.UserLessonStates.AsNoTracking().Where(x => x.UserId == currentUserId.Value && allRelevantLessonIds.Contains(x.LessonId)).ToDictionaryAsync(x => x.LessonId, x => x, ct)
            : lessonStates;
        var pathStateMap = currentUserId.HasValue
            ? await _db.UserPathStates.AsNoTracking().Where(x => x.UserId == currentUserId.Value && x.PathId == path.PathId).ToDictionaryAsync(x => x.PathId, x => x, ct)
            : new Dictionary<Guid, UserPathState>();
        var totalXp = currentUserId.HasValue ? await _db.UserXp.AsNoTracking().Where(x => x.UserId == currentUserId.Value).SumAsync(x => (int?)x.XpDelta, ct) ?? 0 : 0;

        var pathUnlock = BuildPathCards(new[] { path }, prereqs, requiredLessons.Concat(lessons).ToList(), allLessonStates, pathStateMap, totalXp).First();

        var response = new
        {
            pathId = path.PathId,
            title = path.Title,
            slug = path.Slug,
            description = path.Description,
            lessonCount = lessons.Count,
            totalXpReward = path.TotalXpReward,
            progressPercent = pathUnlock.progressPercent,
            state = pathUnlock.state,
            isUnlocked = pathUnlock.isUnlocked,
            requirementSummary = pathUnlock.requirementSummary,
            lessons = lessons.Select(lesson =>
            {
                lessonStates.TryGetValue(lesson.LessonId, out var state);
                var lessonItems = items.Where(x => x.LessonId == lesson.LessonId).OrderBy(x => x.SortOrder).ToList();
                return new
                {
                    lessonId = lesson.LessonId,
                    title = lesson.Title,
                    summary = lesson.Summary,
                    description = lesson.Summary,
                    estimatedMinutes = lesson.EstimatedMinutes,
                    pointsReward = lesson.XpReward > 0 ? lesson.XpReward : lesson.PointsReward,
                    isCompleted = state is not null && IsCompleted(state.Status, state.CompletedAt),
                    items = lessonItems.Select(x =>
                    {
                        var normalizedType = NormalizeItemType(x.ItemType);
                        var itemUnlocked = pathUnlock.isUnlocked && IsLessonItemUnlocked(x, lessonItems, state);
                        return new
                        {
                            lessonItemId = x.LessonItemId,
                            lessonId = lesson.LessonId,
                            itemType = normalizedType,
                            title = x.Title ?? InferItemTitle(x.ItemType),
                            description = x.ContentMarkdown,
                            estimatedMinutes = x.EstimatedMinutes,
                            referenceId = x.RefId,
                            problemId = normalizedType == "problem" ? x.RefId : null,
                            quizId = normalizedType == "quiz" ? x.RefId : null,
                            orderNo = x.SortOrder,
                            pointsReward = lesson.XpReward > 0 ? lesson.XpReward : lesson.PointsReward,
                            isUnlocked = itemUnlocked,
                            isLocked = !itemUnlocked,
                        };
                    }).ToList()
                };
            }).ToList()
        };

        return Ok(response);
    }

    [HttpGet("lessons/{lessonId:guid}")]
    public async Task<IActionResult> GetLesson(Guid lessonId, [FromQuery] string? userId, CancellationToken ct)
    {
        var currentUserId = ParseUserId(userId);
        var lesson = await _db.Lessons.AsNoTracking().FirstOrDefaultAsync(x => x.LessonId == lessonId && x.IsPublished, ct);
        if (lesson is null) return NotFound();

        var items = await _db.LessonItems.AsNoTracking().Where(x => x.LessonId == lessonId).OrderBy(x => x.SortOrder).ToListAsync(ct);
        var state = currentUserId.HasValue
            ? await _db.UserLessonStates.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == currentUserId.Value && x.LessonId == lessonId, ct)
            : null;

        return Ok(new
        {
            lessonId = lesson.LessonId,
            title = lesson.Title,
            summary = lesson.Summary,
            description = lesson.Summary,
            content = lesson.ContentMarkdown,
            estimatedMinutes = lesson.EstimatedMinutes,
            pointsReward = lesson.XpReward > 0 ? lesson.XpReward : lesson.PointsReward,
            isCompleted = state is not null && IsCompleted(state.Status, state.CompletedAt),
            items = items.Select(x => new
            {
                lessonItemId = x.LessonItemId,
                lessonId = lesson.LessonId,
                itemType = NormalizeItemType(x.ItemType),
                title = x.Title ?? InferItemTitle(x.ItemType),
                description = x.ContentMarkdown,
                estimatedMinutes = x.EstimatedMinutes,
                referenceId = x.RefId,
                problemId = NormalizeItemType(x.ItemType) == "problem" ? x.RefId : null,
                quizId = NormalizeItemType(x.ItemType) == "quiz" ? x.RefId : null,
                orderNo = x.SortOrder,
                pointsReward = lesson.XpReward > 0 ? lesson.XpReward : lesson.PointsReward,
                isUnlocked = IsLessonItemUnlocked(x, items, state),
                isLocked = !IsLessonItemUnlocked(x, items, state),
            }).ToList()
        });
    }

    public sealed record CompleteLessonRequest(Guid? UserId, bool Completed = true);

    [HttpPost("lessons/{lessonId:guid}/complete")]
    public async Task<IActionResult> CompleteLesson(Guid lessonId, [FromBody] CompleteLessonRequest request, CancellationToken ct)
    {
        var currentUserId = request.UserId;
        if (!currentUserId.HasValue || currentUserId == Guid.Empty) return BadRequest(new { message = "userId is required" });

        var lessonExists = await _db.Lessons.AsNoTracking().AnyAsync(x => x.LessonId == lessonId && x.IsPublished, ct);
        if (!lessonExists) return NotFound();

        var now = DateTime.UtcNow;
        var result = await _learningProgressService.SetLessonCompletionAsync(currentUserId.Value, lessonId, request.Completed, now, ct);
        await _db.SaveChangesAsync(ct);

        return Ok(new { success = true, lessonId = result.LessonId, completed = result.Completed, earnedXp = result.EarnedXp });
    }

    private static List<PathCardVm> BuildPathCards(
        IReadOnlyList<LearningPath> paths,
        IReadOnlyList<PathPrerequisite> prerequisites,
        IReadOnlyList<Lesson> lessons,
        IReadOnlyDictionary<Guid, UserLessonState> lessonStateMap,
        IReadOnlyDictionary<Guid, UserPathState> pathStateMap,
        int totalXp)
    {
        var result = new List<PathCardVm>();

        foreach (var path in paths)
        {
            var pathLessons = lessons.Where(x => x.PathId == path.PathId).OrderBy(x => x.SortOrder).ToList();
            var completedCount = pathLessons.Count(x => lessonStateMap.TryGetValue(x.LessonId, out var state) && IsCompleted(state.Status, state.CompletedAt));
            var totalLessons = pathLessons.Count;
            var completionPercent = totalLessons <= 0 ? 0m : Math.Round((decimal)completedCount * 100m / totalLessons, 2);
            var hasStarted = completedCount > 0 || pathLessons.Any(x => lessonStateMap.TryGetValue(x.LessonId, out var startedState) && !string.Equals(startedState.Status, "not_started", StringComparison.OrdinalIgnoreCase));
            var isCompleted = totalLessons > 0 && completedCount == totalLessons;
            var prereqRows = prerequisites.Where(x => x.PathId == path.PathId).OrderBy(x => x.SortOrder).ToList();
            var allPrerequisitesSatisfied = prereqRows.All(pr =>
            {
                var requiredLessons = lessons.Where(x => x.PathId == pr.RequiredPathId).ToList();
                var requiredTotal = requiredLessons.Count;
                var requiredCompleted = requiredLessons.Count(x => lessonStateMap.TryGetValue(x.LessonId, out var st) && IsCompleted(st.Status, st.CompletedAt));
                var requiredCompletionPercent = requiredTotal <= 0 ? 0m : Math.Round((decimal)requiredCompleted * 100m / requiredTotal, 2);
                return requiredCompletionPercent >= pr.MinCompletionPercent;
            });
            var unlockedByXp = totalXp >= path.MinimumXpRequired;
            var isUnlocked = (prereqRows.Count == 0 || allPrerequisitesSatisfied) && unlockedByXp;
            if (pathStateMap.TryGetValue(path.PathId, out var savedState) && savedState.IsUnlocked) isUnlocked = true;
            var state = isCompleted ? "completed" : hasStarted ? "active" : isUnlocked ? "active" : "locked";
            var requirementSummary = BuildRequirementSummary(path, prereqRows, paths);
            var currentLessonId = pathLessons.FirstOrDefault(x => !lessonStateMap.TryGetValue(x.LessonId, out var st) || !IsCompleted(st.Status, st.CompletedAt))?.LessonId;
            result.Add(new PathCardVm(path.PathId, path.Title, path.Slug, path.Description, totalLessons, completedCount, path.TotalXpReward, completionPercent, FormatLevel(path.LevelFrom, path.LevelTo), state, isUnlocked, path.EstimatedMinutes, path.MinimumXpRequired, requirementSummary, currentLessonId));
        }

        return result;
    }

    private static bool IsLessonItemUnlocked(LessonItem lessonItem, IReadOnlyList<LessonItem> lessonItems, UserLessonState? state)
    {
        if (lessonItem.UnlockAfterLessonItemId is null) return true;
        if (state is null) return false;
        if (IsCompleted(state.Status, state.CompletedAt)) return true;
        if (!state.CurrentLessonItemId.HasValue) return false;

        var unlockedLessonItemIds = BuildUnlockedLessonItemIds(lessonItems, state.CurrentLessonItemId.Value);
        return unlockedLessonItemIds.Contains(lessonItem.LessonItemId);
    }

    private static HashSet<Guid> BuildUnlockedLessonItemIds(IReadOnlyList<LessonItem> lessonItems, Guid currentLessonItemId)
    {
        var unlockedLessonItemIds = lessonItems
            .Where(x => x.UnlockAfterLessonItemId == null)
            .Select(x => x.LessonItemId)
            .ToHashSet();

        var lessonItemMap = lessonItems.ToDictionary(x => x.LessonItemId);
        var cursor = currentLessonItemId;
        while (lessonItemMap.TryGetValue(cursor, out var item))
        {
            if (!unlockedLessonItemIds.Add(item.LessonItemId)) break;
            if (!item.UnlockAfterLessonItemId.HasValue) break;
            cursor = item.UnlockAfterLessonItemId.Value;
        }

        return unlockedLessonItemIds;
    }

    private static bool IsCompleted(string? status, DateTime? completedAt)
        => completedAt != null || string.Equals(status, "completed", StringComparison.OrdinalIgnoreCase);

    private static Guid? ParseUserId(string? userId) => Guid.TryParse(userId, out var parsed) ? parsed : null;

    private static string NormalizeItemType(string? type)
    {
        var value = (type ?? "reading").Trim().ToLowerInvariant();
        if (value.Contains("quiz")) return "quiz";
        if (value.Contains("problem") || value.Contains("code")) return "problem";
        return "reading";
    }

    private static string InferItemTitle(string? itemType) => NormalizeItemType(itemType) switch
    {
        "quiz" => "Quiz ngắn",
        "problem" => "Thử thách code",
        _ => "Đọc nhanh"
    };

    private static string FormatLevel(byte? from, byte? to)
    {
        if (from.HasValue && to.HasValue) return $"Lv {from}-{to}";
        if (from.HasValue) return $"Lv {from}+";
        return "Mở cho mọi cấp";
    }

    private static int ComputeCurrentStreak(List<DateTime> dates)
    {
        if (dates.Count == 0) return 0;
        var normalized = dates.Select(x => x.Date).Distinct().OrderByDescending(x => x).ToList();
        var streak = 0;
        var cursor = DateTime.UtcNow.Date;
        foreach (var date in normalized)
        {
            if (date == cursor)
            {
                streak++;
                cursor = cursor.AddDays(-1);
                continue;
            }
            if (date == DateTime.UtcNow.Date.AddDays(-1) && streak == 0)
            {
                streak++;
                cursor = date.AddDays(-1);
                continue;
            }
            break;
        }
        return streak;
    }

    private static string? BuildRequirementSummary(LearningPath path, IReadOnlyList<PathPrerequisite> prereqs, IReadOnlyList<LearningPath> allPaths)
    {
        var parts = new List<string>();
        if (path.MinimumXpRequired > 0) parts.Add($"{path.MinimumXpRequired} XP");
        foreach (var prereq in prereqs)
        {
            var requiredPath = allPaths.FirstOrDefault(x => x.PathId == prereq.RequiredPathId);
            var title = requiredPath?.Title ?? "path trước";
            parts.Add($"Hoàn thành {title}");
        }
        return parts.Count == 0 ? null : string.Join(" · ", parts);
    }

    private sealed record PathCardVm(
        Guid pathId,
        string title,
        string slug,
        string? description,
        int lessonCount,
        int completedLessonCount,
        int totalXpReward,
        decimal progressPercent,
        string difficultyLabel,
        string state,
        bool isUnlocked,
        int? estimatedMinutes,
        int minimumXpRequired,
        string? requirementSummary,
        Guid? currentLessonId
    );
}

public sealed record BadgeVm(Guid badgeId, string code, string title, string? description, string? iconUrl, string? colorHex, DateTime earnedAt, bool isUnlocked);
