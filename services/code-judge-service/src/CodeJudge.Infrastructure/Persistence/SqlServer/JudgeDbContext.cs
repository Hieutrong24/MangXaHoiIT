using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Persistence.SqlServer;

public sealed class JudgeDbContext : DbContext
{
    public JudgeDbContext(DbContextOptions<JudgeDbContext> options) : base(options) {}

    public DbSet<Problem> Problems => Set<Problem>();
    public DbSet<TestCase> TestCases => Set<TestCase>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<JudgeResult> SubmissionTestResults => Set<JudgeResult>();
    public DbSet<UserProblemStat> UserProblemStats => Set<UserProblemStat>();
    public DbSet<OutboxEvent> OutboxEvents => Set<OutboxEvent>();
    public DbSet<LearningPath> LearningPaths => Set<LearningPath>();
    public DbSet<PathPrerequisite> PathPrerequisites => Set<PathPrerequisite>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonItem> LessonItems => Set<LessonItem>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizChoice> QuizChoices => Set<QuizChoice>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizAnswer> QuizAnswers => Set<QuizAnswer>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<UserPathState> UserPathStates => Set<UserPathState>();
    public DbSet<UserLessonState> UserLessonStates => Set<UserLessonState>();
    public DbSet<UserXp> UserXp => Set<UserXp>();
    public DbSet<UserStreak> UserStreaks => Set<UserStreak>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<DailyChallenge> DailyChallenges => Set<DailyChallenge>();
    public DbSet<UserChallengeProgress> UserChallengeProgress => Set<UserChallengeProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JudgeDbContext).Assembly);
    }
}
