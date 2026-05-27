using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class JudgeResultConfiguration : IEntityTypeConfiguration<JudgeResult>
{
    public void Configure(EntityTypeBuilder<JudgeResult> b)
    {
        b.ToTable("Judge_SubmissionTestResults");

        b.HasKey(x => x.SubmissionTestResultId);
        b.Property(x => x.SubmissionTestResultId)
            .HasColumnName("SubmissionTestResultId")
            .ValueGeneratedOnAdd();

        b.Property(x => x.SubmissionId).HasColumnName("SubmissionId").IsRequired();
        b.Property(x => x.TestCaseId).HasColumnName("TestCaseId").IsRequired();
        b.Property(x => x.Status).HasColumnName("Status").IsRequired();
        b.Property(x => x.TimeMs).HasColumnName("TimeMs").IsRequired();
        b.Property(x => x.MemoryKB).HasColumnName("MemoryKB").IsRequired();
        b.Property(x => x.ErrorMessage).HasColumnName("ErrorMessage").HasMaxLength(1000);
        b.Property(x => x.ActualOutput).HasColumnName("ActualOutput");
        b.Property(x => x.ExpectedOutput).HasColumnName("ExpectedOutput");
        b.Property(x => x.ScoreEarned).HasColumnName("ScoreEarned").HasColumnType("decimal(10,2)");
        b.Property(x => x.DiffText).HasColumnName("DiffText");
        b.Property(x => x.CheckerNote).HasColumnName("CheckerNote");
        b.Property(x => x.IsSampleCase).HasColumnName("IsSampleCase");
        b.Property(x => x.CaseOrderNo).HasColumnName("CaseOrderNo");
        b.Property(x => x.ExecutionToken).HasColumnName("ExecutionToken").HasMaxLength(100);
        b.Property(x => x.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasIndex(x => new { x.SubmissionId, x.TestCaseId }).IsUnique();
        b.HasIndex(x => x.SubmissionId);

        b.HasOne(x => x.Submission)
            .WithMany(x => x.TestResults)
            .HasForeignKey(x => x.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.TestCase)
            .WithMany()
            .HasForeignKey(x => x.TestCaseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
