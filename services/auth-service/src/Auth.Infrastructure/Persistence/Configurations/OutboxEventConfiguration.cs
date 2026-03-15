using auth_service.src.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace auth_service.src.Auth.Infrastructure.Persistence.Configurations
{
    public class OutboxEventConfiguration : IEntityTypeConfiguration<OutboxEvent>
    {
        public void Configure(EntityTypeBuilder<OutboxEvent> builder)
        {
            builder.ToTable("Auth_OutboxEvents", "dbo");
            builder.HasKey(x => x.EventId);

            builder.Property(x => x.EventId).HasColumnName("EventId");
            builder.Property(x => x.AggregateId).HasColumnName("AggregateId").IsRequired();

            builder.Property(x => x.EventType)
                .HasColumnName("EventType")
                .HasMaxLength(100)
                .IsUnicode()
                .IsRequired();

            builder.Property(x => x.PayloadJson)
                .HasColumnName("PayloadJson")
                .IsUnicode()
                .IsRequired();

            builder.Property(x => x.OccurredAt)
                .HasColumnName("OccurredAt")
                .HasColumnType("datetime2(7)")
                .HasDefaultValueSql("SYSUTCDATETIME()")
                .IsRequired();

            builder.Property(x => x.ProcessedAt)
                .HasColumnName("ProcessedAt")
                .HasColumnType("datetime2(7)");

            builder.Property(x => x.TraceId)
                .HasColumnName("TraceId")
                .HasMaxLength(100)
                .IsUnicode();

            builder.HasIndex(x => new { x.ProcessedAt, x.OccurredAt }); 
        }
    }
}
