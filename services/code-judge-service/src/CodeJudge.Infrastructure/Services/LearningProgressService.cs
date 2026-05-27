using CodeJudge.Application.Interfaces;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Services;

public sealed class LearningProgressService : ILearningProgressService
{
    private readonly JudgeDbContext _db;

    public LearningProgressService(JudgeDbContext db)
    {
        _db = db;
    }

    public async Task<LearningProgressAdvanceResult> AdvanceAfterProblemAcceptedAsync(Guid userId, Guid problemId, DateTime now, CancellationToken ct = default)
    {
        if (userId == Guid.Empty || problemId == Guid.Empty)
        {
            return new LearningProgressAdvanceResult(Array.Empty<Guid>(), Array.Empty<Guid>());
        }

        var matchedItems = await _db.LessonItems
            .Where(x => x.RefId == problemId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        matchedItems = matchedItems
            .Where(x => NormalizeItemType(x.ItemType) == "problem")
            .ToList();

        if (matchedItems.Count == 0)
        {
            return new LearningProgressAdvanceResult(Array.Empty<Guid>(), Array.Empty<Guid>());
        }

        var lessonIds = matchedItems.Select(x => x.LessonId).Distinct().ToList();
        var lessons = await _db.Lessons
            .Where(x => lessonIds.Contains(x.LessonId) && x.IsPublished)
            .ToDictionaryAsync(x => x.LessonId, ct);

        var allLessonItems = await _db.LessonItems
            .Where(x => lessonIds.Contains(x.LessonId))
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var lessonItemsByLessonId = allLessonItems
            .GroupBy(x => x.LessonId)
            .ToDictionary(x => x.Key, x => x.OrderBy(i => i.SortOrder).ToList());

        var advancedLessonIds = new HashSet<Guid>();
        var completedLessonIds = new HashSet<Guid>();
        var completedPathIds = new HashSet<Guid>();

        foreach (var matchedItem in matchedItems)
        {
            if (!lessons.TryGetValue(matchedItem.LessonId, out var lesson))
            {
                continue;
            }

            if (!lessonItemsByLessonId.TryGetValue(lesson.LessonId, out var lessonItems) || lessonItems.Count == 0)
            {
                continue;
            }

            var state = await GetOrCreateLessonStateAsync(userId, lesson.LessonId, now, ct);
            state.StartedAt ??= now;
            state.LastViewedAt = now;
            state.UpdatedAt = now;

            var totalSteps = Math.Max(1, lessonItems.Count);
            var completedSteps = ComputeCompletedSteps(lessonItems, matchedItem);
            var completionPercent = Math.Round((decimal)completedSteps * 100m / totalSteps, 2);
            var nextItem = lessonItems
                .Where(x => x.UnlockAfterLessonItemId == matchedItem.LessonItemId)
                .OrderBy(x => x.SortOrder)
                .FirstOrDefault();

            if (nextItem is null)
            {
                await SetLessonCompletionInternalAsync(userId, lesson, true, now, ct);
                completedLessonIds.Add(lesson.LessonId);
                completedPathIds.Add(lesson.PathId);
            }
            else
            {
                state.Status = "in_progress";
                state.CompletionPercent = Math.Max(state.CompletionPercent, completionPercent);
                state.CurrentLessonItemId = nextItem.LessonItemId;
                state.CompletedAt = null;

                await UpsertLessonProgressAsync(
                    userId,
                    lesson.LessonId,
                    "in_progress",
                    state.CompletionPercent,
                    completedSteps,
                    totalSteps,
                    now,
                    null,
                    ct);

                advancedLessonIds.Add(lesson.LessonId);
            }
        }

        await UpdateUserStreakAsync(userId, now, ct);
        await RecalculateAndPersistUserPathStatesAsync(userId, now, ct);

        foreach (var pathId in completedPathIds)
        {
            await ForceUnlockNextPathAsync(userId, pathId, now, ct);
        }

        return new LearningProgressAdvanceResult(advancedLessonIds.ToList(), completedLessonIds.ToList());
    }

    public async Task<LearningProgressLessonResult> SetLessonCompletionAsync(Guid userId, Guid lessonId, bool completed, DateTime now, CancellationToken ct = default)
    {
        if (userId == Guid.Empty || lessonId == Guid.Empty)
        {
            return new LearningProgressLessonResult(lessonId, completed, 0);
        }

        var lesson = await _db.Lessons.FirstOrDefaultAsync(x => x.LessonId == lessonId && x.IsPublished, ct);
        if (lesson is null)
        {
            return new LearningProgressLessonResult(lessonId, completed, 0);
        }

        var result = await SetLessonCompletionInternalAsync(userId, lesson, completed, now, ct);
        await UpdateUserStreakAsync(userId, now, ct);
        await RecalculateAndPersistUserPathStatesAsync(userId, now, ct);

        if (completed)
        {
            await ForceUnlockNextPathAsync(userId, lesson.PathId, now, ct);
        }

        return result;
    }

    private async Task<LearningProgressLessonResult> SetLessonCompletionInternalAsync(Guid userId, Lesson lesson, bool completed, DateTime now, CancellationToken ct)
    {
        var lessonItems = await _db.LessonItems
            .Where(x => x.LessonId == lesson.LessonId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var totalSteps = Math.Max(1, lessonItems.Count);
        var firstItem = lessonItems.FirstOrDefault(x => x.UnlockAfterLessonItemId == null) ?? lessonItems.FirstOrDefault();
        var lastItem = lessonItems.LastOrDefault();
        var state = await GetOrCreateLessonStateAsync(userId, lesson.LessonId, now, ct);

        state.StartedAt ??= now;
        state.LastViewedAt = now;
        state.UpdatedAt = now;

        if (completed)
        {
            state.Status = "completed";
            state.CompletionPercent = 100m;
            state.CurrentLessonItemId = lastItem?.LessonItemId ?? state.CurrentLessonItemId;
            state.CompletedAt ??= now;
        }
        else
        {
            if (!string.Equals(state.Status, "completed", StringComparison.OrdinalIgnoreCase))
            {
                state.Status = "in_progress";
                state.CompletionPercent = Math.Max(state.CompletionPercent, 0m);
                state.CompletedAt = null;
            }

            state.CurrentLessonItemId ??= firstItem?.LessonItemId;
        }

        await UpsertLessonProgressAsync(
            userId,
            lesson.LessonId,
            completed
                ? "completed"
                : string.Equals(state.Status, "completed", StringComparison.OrdinalIgnoreCase)
                    ? "completed"
                    : "in_progress",
            completed ? 100m : state.CompletionPercent,
            completed ? totalSteps : 0,
            totalSteps,
            now,
            completed ? now : null,
            ct);

        var earnedXp = 0;
        if (completed)
        {
            var alreadyRewarded = HasLocalLessonXpReward(userId, lesson.LessonId) ||
                                  await _db.UserXp.AsNoTracking()
                                      .AnyAsync(x => x.UserId == userId && x.SourceType == "lesson" && x.SourceId == lesson.LessonId, ct);

            if (!alreadyRewarded)
            {
                earnedXp = lesson.XpReward > 0 ? lesson.XpReward : lesson.PointsReward;
                _db.UserXp.Add(new UserXp
                {
                    UserXpId = Guid.NewGuid(),
                    UserId = userId,
                    SourceType = "lesson",
                    SourceId = lesson.LessonId,
                    XpDelta = earnedXp,
                    Reason = $"Completed lesson: {lesson.Title}",
                    CreatedAt = now,
                });
            }
        }

        return new LearningProgressLessonResult(lesson.LessonId, completed, earnedXp);
    }

    private async Task<UserLessonState> GetOrCreateLessonStateAsync(Guid userId, Guid lessonId, DateTime now, CancellationToken ct)
    {
        var localState = _db.UserLessonStates.Local
            .FirstOrDefault(x => x.UserId == userId && x.LessonId == lessonId);

        if (localState is not null)
        {
            return localState;
        }

        var state = await _db.UserLessonStates
            .FirstOrDefaultAsync(x => x.UserId == userId && x.LessonId == lessonId, ct);

        if (state is not null)
        {
            return state;
        }

        state = new UserLessonState
        {
            UserLessonStateId = Guid.NewGuid(),
            UserId = userId,
            LessonId = lessonId,
            Status = "not_started",
            CompletionPercent = 0m,
            CreatedAt = now,
            UpdatedAt = now,
        };

        _db.UserLessonStates.Add(state);
        return state;
    }

    private async Task<UserPathState> GetOrCreatePathStateAsync(Guid userId, Guid pathId, DateTime now, CancellationToken ct)
    {
        var localState = _db.UserPathStates.Local
            .FirstOrDefault(x => x.UserId == userId && x.PathId == pathId);

        if (localState is not null)
        {
            return localState;
        }

        var state = await _db.UserPathStates
            .FirstOrDefaultAsync(x => x.UserId == userId && x.PathId == pathId, ct);

        if (state is not null)
        {
            return state;
        }

        state = new UserPathState
        {
            UserPathStateId = Guid.NewGuid(),
            UserId = userId,
            PathId = pathId,
            Status = "locked",
            IsUnlocked = false,
            CompletionPercent = 0m,
            LessonsCompletedCount = 0,
            TotalLessonsCount = 0,
            CreatedAt = now,
            UpdatedAt = now,
        };

        _db.UserPathStates.Add(state);
        return state;
    }

    private async Task<UserProgress> GetOrCreateLessonProgressAsync(Guid userId, Guid lessonId, DateTime now, CancellationToken ct)
    {
        var localProgress = _db.UserProgress.Local
            .FirstOrDefault(x => x.UserId == userId && x.ProgressType == "lesson" && x.EntityId == lessonId);

        if (localProgress is not null)
        {
            return localProgress;
        }

        var progress = await _db.UserProgress.FirstOrDefaultAsync(
            x => x.UserId == userId && x.ProgressType == "lesson" && x.EntityId == lessonId,
            ct);

        if (progress is not null)
        {
            return progress;
        }

        progress = new UserProgress
        {
            UserProgressId = Guid.NewGuid(),
            UserId = userId,
            ProgressType = "lesson",
            EntityId = lessonId,
            Status = "not_started",
            CompletionPercent = 0m,
            CurrentStep = 0,
            TotalSteps = 0,
            StartedAt = now,
            LastActivityAt = now,
            CreatedAt = now,
            UpdatedAt = now,
        };

        _db.UserProgress.Add(progress);
        return progress;
    }

    private async Task UpsertLessonProgressAsync(
        Guid userId,
        Guid lessonId,
        string status,
        decimal completionPercent,
        int currentStep,
        int totalSteps,
        DateTime now,
        DateTime? completedAt,
        CancellationToken ct)
    {
        var progress = await GetOrCreateLessonProgressAsync(userId, lessonId, now, ct);

        progress.Status = status;
        progress.CompletionPercent = Math.Max(progress.CompletionPercent, completionPercent);
        progress.CurrentStep = Math.Max(progress.CurrentStep, currentStep);
        progress.TotalSteps = totalSteps;
        progress.StartedAt ??= now;
        progress.LastActivityAt = now;
        progress.CompletedAt = completedAt is not null ? (progress.CompletedAt ?? completedAt) : progress.CompletedAt;
        progress.UpdatedAt = now;
    }

    private async Task ForceUnlockNextPathAsync(Guid userId, Guid currentPathId, DateTime now, CancellationToken ct)
    {
        var currentPath = await _db.LearningPaths.FirstOrDefaultAsync(x => x.PathId == currentPathId, ct);
        if (currentPath is null)
        {
            return;
        }

        var nextPath = await _db.LearningPaths
            .Where(x => x.IsPublic && x.Status == 1 && x.SortOrder > currentPath.SortOrder)
            .OrderBy(x => x.SortOrder)
            .FirstOrDefaultAsync(ct);

        if (nextPath is null)
        {
            return;
        }

        var nextState = await GetOrCreatePathStateAsync(userId, nextPath.PathId, now, ct);
        nextState.IsUnlocked = true;
        nextState.Status = "active";
        nextState.UnlockedAt ??= now;
        nextState.UpdatedAt = now;
    }

    private async Task RecalculateAndPersistUserPathStatesAsync(Guid userId, DateTime now, CancellationToken ct)
    {
        var paths = await _db.LearningPaths
            .Where(x => x.IsPublic && x.Status == 1)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        if (paths.Count == 0)
        {
            return;
        }

        var pathIds = paths.Select(x => x.PathId).ToList();
        var prerequisites = await _db.PathPrerequisites
            .Where(x => pathIds.Contains(x.PathId))
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var lessons = await _db.Lessons
            .Where(x => pathIds.Contains(x.PathId) && x.IsPublished)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var lessonIds = lessons.Select(x => x.LessonId).ToList();

        var lessonStates = await GetLessonStatesMapAsync(userId, lessonIds, ct);
        var existingStates = await GetPathStatesMapAsync(userId, pathIds, ct);
        var totalXp = await GetTotalXpIncludingPendingAsync(userId, ct);

        var cardStates = BuildPathCards(paths, prerequisites, lessons, lessonStates, existingStates, totalXp);

        foreach (var card in cardStates)
        {
            var state = await GetOrCreatePathStateAsync(userId, card.pathId, now, ct);

            state.Status = card.state;
            state.IsUnlocked = card.isUnlocked;
            state.CompletionPercent = card.progressPercent;
            state.LessonsCompletedCount = card.completedLessonCount;
            state.TotalLessonsCount = card.lessonCount;
            state.LastActivityAt = now;
            state.CurrentLessonId = card.currentLessonId;
            state.UnlockedAt ??= card.isUnlocked ? now : null;
            state.StartedAt ??= card.hasStarted ? now : null;
            state.CompletedAt = card.state == "completed" ? (state.CompletedAt ?? now) : null;
            state.UpdatedAt = now;
        }
    }

    private async Task UpdateUserStreakAsync(Guid userId, DateTime now, CancellationToken ct)
    {
        var today = now.Date;

        var streak = _db.UserStreaks.Local.FirstOrDefault(x => x.UserId == userId)
                     ?? await _db.UserStreaks.FirstOrDefaultAsync(x => x.UserId == userId, ct);

        if (streak is null)
        {
            streak = new UserStreak
            {
                UserStreakId = Guid.NewGuid(),
                UserId = userId,
                CurrentStreakDays = 1,
                LongestStreakDays = 1,
                LastLearningDate = today,
                CreatedAt = now,
                UpdatedAt = now,
            };
            _db.UserStreaks.Add(streak);
            return;
        }

        if (streak.LastLearningDate?.Date == today)
        {
            streak.UpdatedAt = now;
            return;
        }

        if (streak.LastLearningDate?.Date == today.AddDays(-1))
        {
            streak.CurrentStreakDays += 1;
        }
        else
        {
            streak.CurrentStreakDays = 1;
        }

        streak.LongestStreakDays = Math.Max(streak.LongestStreakDays, streak.CurrentStreakDays);
        streak.LastLearningDate = today;
        streak.UpdatedAt = now;
    }

    private async Task<Dictionary<Guid, UserLessonState>> GetLessonStatesMapAsync(Guid userId, IReadOnlyCollection<Guid> lessonIds, CancellationToken ct)
    {
        var result = _db.UserLessonStates.Local
            .Where(x => x.UserId == userId && lessonIds.Contains(x.LessonId))
            .ToDictionary(x => x.LessonId, x => x);

        if (lessonIds.Count == 0)
        {
            return result;
        }

        var dbStates = await _db.UserLessonStates
            .Where(x => x.UserId == userId && lessonIds.Contains(x.LessonId))
            .ToListAsync(ct);

        foreach (var state in dbStates)
        {
            if (!result.ContainsKey(state.LessonId))
            {
                result[state.LessonId] = state;
            }
        }

        return result;
    }

    private async Task<Dictionary<Guid, UserPathState>> GetPathStatesMapAsync(Guid userId, IReadOnlyCollection<Guid> pathIds, CancellationToken ct)
    {
        var result = _db.UserPathStates.Local
            .Where(x => x.UserId == userId && pathIds.Contains(x.PathId))
            .ToDictionary(x => x.PathId, x => x);

        if (pathIds.Count == 0)
        {
            return result;
        }

        var dbStates = await _db.UserPathStates
            .Where(x => x.UserId == userId && pathIds.Contains(x.PathId))
            .ToListAsync(ct);

        foreach (var state in dbStates)
        {
            if (!result.ContainsKey(state.PathId))
            {
                result[state.PathId] = state;
            }
        }

        return result;
    }

    private async Task<int> GetTotalXpIncludingPendingAsync(Guid userId, CancellationToken ct)
    {
        var persistedXp = await _db.UserXp
            .Where(x => x.UserId == userId)
            .SumAsync(x => (int?)x.XpDelta, ct) ?? 0;

        var pendingXp = _db.ChangeTracker.Entries<UserXp>()
            .Where(x => x.State == EntityState.Added && x.Entity.UserId == userId)
            .Sum(x => x.Entity.XpDelta);

        return persistedXp + pendingXp;
    }

    private bool HasLocalLessonXpReward(Guid userId, Guid lessonId)
    {
        return _db.UserXp.Local.Any(x =>
            x.UserId == userId &&
            x.SourceType == "lesson" &&
            x.SourceId == lessonId);
    }

    private static List<PathCardState> BuildPathCards(
        IReadOnlyList<LearningPath> paths,
        IReadOnlyList<PathPrerequisite> prerequisites,
        IReadOnlyList<Lesson> lessons,
        IReadOnlyDictionary<Guid, UserLessonState> lessonStateMap,
        IReadOnlyDictionary<Guid, UserPathState> pathStateMap,
        int totalXp)
    {
        var result = new List<PathCardState>();

        foreach (var path in paths)
        {
            var pathLessons = lessons.Where(x => x.PathId == path.PathId).OrderBy(x => x.SortOrder).ToList();
            var completedCount = pathLessons.Count(x => lessonStateMap.TryGetValue(x.LessonId, out var state) && IsCompleted(state.Status, state.CompletedAt));
            var totalLessons = pathLessons.Count;
            var completionPercent = totalLessons <= 0 ? 0m : Math.Round((decimal)completedCount * 100m / totalLessons, 2);
            var hasStarted = completedCount > 0 || pathLessons.Any(x => lessonStateMap.TryGetValue(x.LessonId, out var state) && !string.Equals(state.Status, "not_started", StringComparison.OrdinalIgnoreCase));
            var isCompleted = totalLessons > 0 && completedCount == totalLessons;

            var prereqRows = prerequisites.Where(x => x.PathId == path.PathId).OrderBy(x => x.SortOrder).ToList();
            var allPrerequisitesSatisfied = prereqRows.All(pr =>
            {
                var requiredLessons = lessons.Where(x => x.PathId == pr.RequiredPathId).ToList();
                var requiredTotal = requiredLessons.Count;
                var requiredCompleted = requiredLessons.Count(x => lessonStateMap.TryGetValue(x.LessonId, out var st) && IsCompleted(st.Status, st.CompletedAt));
                var requiredCompletionPercent = requiredTotal <= 0
                    ? 0m
                    : Math.Round((decimal)requiredCompleted * 100m / requiredTotal, 2);

                return requiredCompletionPercent >= pr.MinCompletionPercent;
            });

            var unlockedByXp = totalXp >= path.MinimumXpRequired;
            var isUnlocked = (prereqRows.Count == 0 || allPrerequisitesSatisfied) && unlockedByXp;

            if (pathStateMap.TryGetValue(path.PathId, out var savedState) && savedState.IsUnlocked)
            {
                isUnlocked = true;
            }

            var state = isCompleted
                ? "completed"
                : hasStarted
                    ? "active"
                    : isUnlocked
                        ? "active"
                        : "locked";

            var currentLessonId = pathLessons
                .FirstOrDefault(x => !lessonStateMap.TryGetValue(x.LessonId, out var st) || !IsCompleted(st.Status, st.CompletedAt))
                ?.LessonId;

            result.Add(new PathCardState(
                path.PathId,
                totalLessons,
                completedCount,
                completionPercent,
                state,
                isUnlocked,
                currentLessonId,
                hasStarted));
        }

        return result;
    }

    private static int ComputeCompletedSteps(IReadOnlyList<LessonItem> lessonItems, LessonItem completedItem)
    {
        var orderedItems = lessonItems.OrderBy(x => x.SortOrder).ToList();
        var index = orderedItems.FindIndex(x => x.LessonItemId == completedItem.LessonItemId);
        return index < 0 ? 0 : index + 1;
    }

    private static bool IsCompleted(string? status, DateTime? completedAt)
        => completedAt != null || string.Equals(status, "completed", StringComparison.OrdinalIgnoreCase);

    private static string NormalizeItemType(string? type)
    {
        var value = (type ?? "reading").Trim().ToLowerInvariant();
        if (value.Contains("quiz")) return "quiz";
        if (value.Contains("problem") || value.Contains("code")) return "problem";
        return "reading";
    }

    private sealed record PathCardState(
        Guid pathId,
        int lessonCount,
        int completedLessonCount,
        decimal progressPercent,
        string state,
        bool isUnlocked,
        Guid? currentLessonId,
        bool hasStarted);
}
