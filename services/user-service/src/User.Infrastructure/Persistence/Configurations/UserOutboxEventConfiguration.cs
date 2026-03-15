using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using User.Infrastructure.Outbox;

namespace User.Infrastructure.Persistence.Configurations;

public sealed class UserOutboxEventConfiguration : IEntityTypeConfiguration<UserOutboxEvent>
{
    public void Configure(EntityTypeBuilder<UserOutboxEvent> b)
    {
        b.ToTable("User_OutboxEvents", "dbo");
        b.HasKey(x => x.EventId);

        b.Property(x => x.EventId).ValueGeneratedNever();
        b.Property(x => x.AggregateId).IsRequired();
        b.Property(x => x.EventType).HasMaxLength(100).IsRequired();
        b.Property(x => x.PayloadJson).HasColumnType("NVARCHAR(MAX)").IsRequired();
        b.Property(x => x.OccurredAt).HasDefaultValueSql("SYSUTCDATETIME()");
        b.Property(x => x.TraceId).HasMaxLength(100);

        b.HasIndex(x => new { x.ProcessedAt, x.OccurredAt }).HasDatabaseName("IX_User_OutboxEvents_ProcessedAt_OccurredAt");
    }
}
