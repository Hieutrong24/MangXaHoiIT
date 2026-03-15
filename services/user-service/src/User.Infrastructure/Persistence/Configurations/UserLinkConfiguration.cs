using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using User.Domain.Entities;

namespace User.Infrastructure.Persistence.Configurations;

public sealed class UserLinkConfiguration : IEntityTypeConfiguration<UserLink>
{
    public void Configure(EntityTypeBuilder<UserLink> b)
    {
        b.ToTable("UserLinks", "dbo");
        b.HasKey(x => x.LinkId);

        b.Property(x => x.LinkId).ValueGeneratedNever();
        b.Property(x => x.UserId).IsRequired();
        b.Property(x => x.Type).HasMaxLength(30).IsRequired();
        b.Property(x => x.Url).HasMaxLength(500).IsRequired();
        b.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasIndex(x => x.UserId).HasDatabaseName("IX_UserLinks_UserId");
    }
}
