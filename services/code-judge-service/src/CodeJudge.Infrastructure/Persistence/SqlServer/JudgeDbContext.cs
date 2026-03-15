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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JudgeDbContext).Assembly);
    }
}
