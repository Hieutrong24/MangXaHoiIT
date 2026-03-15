using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class TestCaseConfiguration : IEntityTypeConfiguration<TestCase>
{
    public void Configure(EntityTypeBuilder<TestCase> b)
    {
        b.ToTable("Judge_TestCases");
        b.HasKey(x => x.TestCaseId);

        b.Property(x => x.InputData).HasColumnType("varbinary(max)").IsRequired();
        b.Property(x => x.OutputData).HasColumnType("varbinary(max)").IsRequired();
        b.Property(x => x.IsSample).HasDefaultValue(false);
        b.Property(x => x.Score).HasDefaultValue(0);
        b.Property(x => x.OrderNo).IsRequired();

        b.HasIndex(x => new { x.ProblemId, x.OrderNo }).IsUnique();
    }
}
