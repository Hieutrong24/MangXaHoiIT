using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> b)
    {
        b.ToTable("Judge_Submissions");
        b.HasKey(x => x.SubmissionId);

        b.Property(x => x.SourceCode).IsRequired();
        b.Property(x => x.CodeHash).HasColumnType("binary(32)").IsRequired(false);
        b.Property(x => x.SubmittedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.Property(x => x.Status)
             .HasConversion<byte>()
             .HasColumnType("tinyint")
             .HasDefaultValue(SubmissionStatus.Queued);

        b.Property(x => x.Score)
            .HasColumnType("decimal(10,2)")
            .HasDefaultValue(0m);

        b.Property(x => x.TotalTimeMs)
            .HasDefaultValue(0);

        b.Property(x => x.TotalMemoryKB)
            .HasDefaultValue(0);


        b.Property(x => x.CompilerMessage).HasMaxLength(2000);
        b.Property(x => x.SubmissionType).HasMaxLength(30).IsRequired(false);

        b.HasIndex(x => new { x.UserId, x.SubmittedAt });
        b.HasIndex(x => new { x.ProblemId, x.SubmittedAt });
        b.HasIndex(x => new { x.Status, x.SubmittedAt });

        b.HasOne(x => x.Problem).WithMany().HasForeignKey(x => x.ProblemId);
        b.HasOne(x => x.Language).WithMany().HasForeignKey(x => x.LanguageId);

        b.HasMany(x => x.TestResults).WithOne(x => x.Submission!).HasForeignKey(x => x.SubmissionId);
    }
}
