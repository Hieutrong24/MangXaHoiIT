namespace CodeJudge.Application.Interfaces;

public interface ILearningProgressService
{
    Task<LearningProgressAdvanceResult> AdvanceAfterProblemAcceptedAsync(Guid userId, Guid problemId, DateTime now, CancellationToken ct = default);
    Task<LearningProgressLessonResult> SetLessonCompletionAsync(Guid userId, Guid lessonId, bool completed, DateTime now, CancellationToken ct = default);
}

public sealed record LearningProgressAdvanceResult(
    IReadOnlyList<Guid> AdvancedLessonIds,
    IReadOnlyList<Guid> CompletedLessonIds);

public sealed record LearningProgressLessonResult(
    Guid LessonId,
    bool Completed,
    int EarnedXp);
