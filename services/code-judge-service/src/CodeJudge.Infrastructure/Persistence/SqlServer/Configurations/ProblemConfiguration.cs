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

        b.Property(x => x.ProblemId).HasColumnName("ProblemId");
        b.Property(x => x.Title).HasMaxLength(200).IsRequired();
        b.Property(x => x.Slug).HasMaxLength(200).IsRequired();
        b.HasIndex(x => x.Slug).IsUnique();

        b.Property(x => x.Difficulty).IsRequired();
        b.Property(x => x.TimeLimitMs).IsRequired();
        b.Property(x => x.MemoryLimitMB).IsRequired();
        b.Property(x => x.Statement).IsRequired();
        b.Property(x => x.CreatedByUserId).IsRequired();
        b.Property(x => x.IsPublic).HasDefaultValue(true);

        b.Property(x => x.Status)
            .HasConversion<byte>()
            .HasColumnType("tinyint")
            .HasDefaultValueSql("1");  


        b.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        b.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasMany(x => x.TestCases).WithOne(x => x.Problem!).HasForeignKey(x => x.ProblemId);
    }
}
