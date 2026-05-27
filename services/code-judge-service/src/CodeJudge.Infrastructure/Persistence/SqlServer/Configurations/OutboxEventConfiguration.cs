using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class OutboxEventConfiguration : IEntityTypeConfiguration<OutboxEvent>
{
    public void Configure(EntityTypeBuilder<OutboxEvent> b)
    {
        b.ToTable("Judge_OutboxEvents");
        b.HasKey(x => x.EventId);

        b.Property(x => x.EventType).HasMaxLength(100).IsRequired();
        b.Property(x => x.PayloadJson).IsRequired();
        b.Property(x => x.OccurredAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasIndex(x => new { x.ProcessedAt, x.OccurredAt });
    }
}
