using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class JudgeResultConfiguration : IEntityTypeConfiguration<JudgeResult>
{
    public void Configure(EntityTypeBuilder<JudgeResult> b)
    {
        b.ToTable("Judge_SubmissionTestResults");
        b.HasKey(x => x.Id);

        b.Property(x => x.Status).IsRequired();
        b.Property(x => x.TimeMs).IsRequired();
        b.Property(x => x.MemoryKB).IsRequired();
        b.Property(x => x.ErrorMessage).HasMaxLength(1000);
        b.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasIndex(x => new { x.SubmissionId, x.TestCaseId }).IsUnique();
        b.HasIndex(x => x.SubmissionId);

        b.HasOne(x => x.TestCase).WithMany().HasForeignKey(x => x.TestCaseId);
    }
}
