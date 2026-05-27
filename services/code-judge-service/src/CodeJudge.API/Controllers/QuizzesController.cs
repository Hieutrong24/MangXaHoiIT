using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/quizzes")]
public sealed class QuizzesController : ControllerBase
{
    private readonly JudgeDbContext _db;
    public QuizzesController(JudgeDbContext db) => _db = db;

    [HttpGet("{quizId:guid}")]
    public async Task<IActionResult> GetQuiz(Guid quizId, CancellationToken ct)
    {
        var quiz = await _db.Quizzes.AsNoTracking().FirstOrDefaultAsync(x => x.QuizId == quizId && x.IsPublished, ct);
        if (quiz is null) return NotFound();

        var questions = await _db.QuizQuestions.AsNoTracking()
            .Where(x => x.QuizId == quizId && x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        var questionIds = questions.Select(x => x.QuestionId).ToList();
        var choices = await _db.QuizChoices.AsNoTracking()
            .Where(x => questionIds.Contains(x.QuestionId))
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        return Ok(new
        {
            quizId = quiz.QuizId,
            title = quiz.Title,
            description = quiz.Description,
            estimatedMinutes = quiz.EstimatedMinutes,
            pointsReward = quiz.XpReward > 0 ? quiz.XpReward : quiz.PointsReward,
            questions = questions.Select(q => new
            {
                questionId = q.QuestionId,
                content = q.Prompt,
                explanation = q.Explanation,
                choices = choices.Where(c => c.QuestionId == q.QuestionId)
                    .OrderBy(c => c.SortOrder)
                    .Select(c => new { choiceId = c.ChoiceId, content = c.ChoiceText, isCorrect = c.IsCorrect })
                    .ToList()
            }).ToList()
        });
    }

    public sealed record QuizAttemptAnswerReq(Guid QuestionId, Guid? ChoiceId);
    public sealed record SubmitQuizAttemptRequest(Guid? UserId, List<QuizAttemptAnswerReq>? Answers);

    [HttpPost("{quizId:guid}/attempts")]
    public async Task<IActionResult> SubmitAttempt(Guid quizId, [FromBody] SubmitQuizAttemptRequest request, CancellationToken ct)
    {
        if (!request.UserId.HasValue || request.UserId == Guid.Empty) return BadRequest(new { message = "userId is required" });
        var quiz = await _db.Quizzes.FirstOrDefaultAsync(x => x.QuizId == quizId && x.IsPublished, ct);
        if (quiz is null) return NotFound();

        var questions = await _db.QuizQuestions.AsNoTracking().Where(x => x.QuizId == quizId && x.IsActive).OrderBy(x => x.SortOrder).ToListAsync(ct);
        var questionIds = questions.Select(x => x.QuestionId).ToList();
        var choices = await _db.QuizChoices.AsNoTracking().Where(x => questionIds.Contains(x.QuestionId)).ToListAsync(ct);
        var answersMap = (request.Answers ?? new List<QuizAttemptAnswerReq>()).ToDictionary(x => x.QuestionId, x => x.ChoiceId);
        var maxAttemptNo = await _db.QuizAttempts.AsNoTracking().Where(x => x.QuizId == quizId && x.UserId == request.UserId.Value).MaxAsync(x => (int?)x.AttemptNo, ct) ?? 0;

        var now = DateTime.UtcNow;
        var attempt = new QuizAttempt
        {
            QuizAttemptId = Guid.NewGuid(),
            QuizId = quizId,
            UserId = request.UserId.Value,
            AttemptNo = maxAttemptNo + 1,
            Status = "submitted",
            StartedAt = now,
            SubmittedAt = now,
            TimeSpentSeconds = 0,
            EarnedXp = 0,
        };

        var answerEntities = new List<QuizAnswer>();
        decimal score = 0m;
        var correctCount = 0;
        var wrongCount = 0;
        var unansweredCount = 0;

        foreach (var question in questions)
        {
            answersMap.TryGetValue(question.QuestionId, out var selectedChoiceId);
            var selectedChoice = selectedChoiceId.HasValue ? choices.FirstOrDefault(x => x.ChoiceId == selectedChoiceId.Value) : null;
            var isCorrect = selectedChoice?.IsCorrect == true;
            if (!selectedChoiceId.HasValue) unansweredCount++;
            else if (isCorrect) correctCount++;
            else wrongCount++;

            var pointsEarned = isCorrect ? question.Points : 0m;
            score += pointsEarned;

            answerEntities.Add(new QuizAnswer
            {
                QuizAnswerId = Guid.NewGuid(),
                QuizAttemptId = attempt.QuizAttemptId,
                QuestionId = question.QuestionId,
                ChoiceId = selectedChoiceId,
                IsCorrect = isCorrect,
                PointsEarned = pointsEarned,
                AnsweredAt = now,
                FeedbackText = isCorrect ? "Chính xác" : (selectedChoiceId.HasValue ? "Chưa đúng" : "Chưa trả lời")
            });
        }

        var totalPoints = questions.Sum(x => x.Points);
        var percentage = totalPoints <= 0 ? 0m : Math.Round(score * 100m / totalPoints, 2);
        var passed = percentage >= quiz.PassingScore;
        var earnedXp = passed ? (quiz.XpReward > 0 ? quiz.XpReward : quiz.PointsReward) : Math.Max(0, (int)Math.Round(percentage / 10m));

        attempt.CorrectCount = correctCount;
        attempt.WrongCount = wrongCount;
        attempt.UnansweredCount = unansweredCount;
        attempt.Score = score;
        attempt.Percentage = percentage;
        attempt.IsPassed = passed;
        attempt.EarnedXp = earnedXp;

        _db.QuizAttempts.Add(attempt);
        _db.QuizAnswers.AddRange(answerEntities);

        _db.UserXp.Add(new UserXp
        {
            UserXpId = Guid.NewGuid(),
            UserId = request.UserId.Value,
            SourceType = "quiz",
            SourceId = quizId,
            XpDelta = earnedXp,
            Reason = $"Quiz attempt: {quiz.Title}",
            CreatedAt = now,
        });

        if (quiz.LessonId.HasValue)
        {
            var state = await _db.UserLessonStates.FirstOrDefaultAsync(x => x.UserId == request.UserId.Value && x.LessonId == quiz.LessonId.Value, ct);
            if (state is null)
            {
                state = new UserLessonState
                {
                    UserLessonStateId = Guid.NewGuid(),
                    UserId = request.UserId.Value,
                    LessonId = quiz.LessonId.Value,
                    Status = passed ? "completed" : "in_progress",
                    CompletionPercent = passed ? 100m : 60m,
                    StartedAt = now,
                    LastViewedAt = now,
                    CompletedAt = passed ? now : null,
                    CreatedAt = now,
                    UpdatedAt = now,
                };
                _db.UserLessonStates.Add(state);
            }
            else
            {
                state.Status = passed ? "completed" : state.Status;
                state.CompletionPercent = Math.Max(state.CompletionPercent, passed ? 100m : 60m);
                state.LastViewedAt = now;
                state.CompletedAt ??= passed ? now : null;
                state.UpdatedAt = now;
            }
        }

        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            quizAttemptId = attempt.QuizAttemptId,
            totalQuestions = questions.Count,
            correctCount,
            wrongCount,
            unansweredCount,
            score = percentage,
            rawScore = score,
            earnedXp,
            isPassed = passed,
            answers = answerEntities.Select(x => new { questionId = x.QuestionId, choiceId = x.ChoiceId, isCorrect = x.IsCorrect, feedback = x.FeedbackText })
        });
    }
}
