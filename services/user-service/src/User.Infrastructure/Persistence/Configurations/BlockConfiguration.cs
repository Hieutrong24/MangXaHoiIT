using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using User.Domain.Entities;

namespace User.Infrastructure.Persistence.Configurations;

public sealed class BlockConfiguration : IEntityTypeConfiguration<Block>
{
    public void Configure(EntityTypeBuilder<Block> b)
    {
        b.ToTable("Blocks", "dbo");
        b.HasKey(x => new { x.BlockerId, x.BlockedId });

        b.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        b.HasIndex(x => x.BlockedId).HasDatabaseName("IX_Blocks_BlockedId");
    }
}
