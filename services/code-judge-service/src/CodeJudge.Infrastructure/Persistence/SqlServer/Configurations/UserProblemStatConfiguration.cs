using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class UserProblemStatConfiguration : IEntityTypeConfiguration<UserProblemStat>
{
    public void Configure(EntityTypeBuilder<UserProblemStat> b)
    {
        b.ToTable("Judge_UserProblemStats");
        b.HasKey(x => new { x.UserId, x.ProblemId });

        b.Property(x => x.Attempts).HasDefaultValue(0);
        b.Property(x => x.LastSubmittedAt).IsRequired();

        b.HasIndex(x => new { x.ProblemId, x.BestStatus, x.BestTimeMs });
        b.HasIndex(x => new { x.UserId, x.LastSubmittedAt });
    }
}
