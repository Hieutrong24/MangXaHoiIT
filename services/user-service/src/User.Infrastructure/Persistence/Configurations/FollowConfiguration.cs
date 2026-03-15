using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using User.Domain.Entities;

namespace User.Infrastructure.Persistence.Configurations;

public sealed class FollowConfiguration : IEntityTypeConfiguration<Follow>
{
    public void Configure(EntityTypeBuilder<Follow> b)
    {
        b.ToTable("Follows", "dbo");
        b.HasKey(x => new { x.FollowerId, x.FolloweeId });

        b.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasIndex(x => new { x.FolloweeId, x.CreatedAt }).HasDatabaseName("IX_Follows_FolloweeId_CreatedAt");
        b.HasIndex(x => new { x.FollowerId, x.CreatedAt }).HasDatabaseName("IX_Follows_FollowerId_CreatedAt");
    }
}
