using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class ProblemConfiguration : IEntityTypeConfiguration<Problem>
{
    public void Configure(EntityTypeBuilder<Problem> b)
    {
        b.ToTable("Judge_Problems");
        b.HasKey(x => x.ProblemId);
        b.Property(x => x.Title).HasMaxLength(300).IsRequired();
        b.Property(x => x.Slug).HasMaxLength(300).IsRequired();
        b.HasIndex(x => x.Slug).IsUnique();
        b.Property(x => x.Difficulty).IsRequired();
        b.Property(x => x.TimeLimitMs).IsRequired();
        b.Property(x => x.MemoryLimitMB).IsRequired();
        b.Property(x => x.Statement).IsRequired();
        b.Property(x => x.CreatedByUserId).IsRequired();
        b.Property(x => x.IsPublic).HasDefaultValue(true);
        b.Property(x => x.Status).HasConversion<byte>().HasColumnType("tinyint").HasDefaultValueSql("1");
        b.Property(x => x.PassPercentage).HasColumnType("decimal(5,2)").HasDefaultValue(100m);
        b.Property(x => x.MaxScore).HasDefaultValue(100);
        b.Property(x => x.IsFeatured).HasDefaultValue(false);
        b.Property(x => x.AllowCustomInput).HasDefaultValue(true);
        b.Property(x => x.AllowPartialScoring).HasDefaultValue(false);
        b.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        b.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        b.HasMany(x => x.TestCases).WithOne(x => x.Problem!).HasForeignKey(x => x.ProblemId);
    }
}
