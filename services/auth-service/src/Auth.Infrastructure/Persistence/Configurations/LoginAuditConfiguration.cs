using auth_service.src.Auth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace auth_service.src.Auth.Infrastructure.Persistence.Configurations
{
    public class LoginAuditConfiguration : IEntityTypeConfiguration<LoginAuditLog>
    {
        public void Configure(EntityTypeBuilder<LoginAuditLog> builder)
        {
            builder.ToTable("Auth_LoginAuditLogs", "dbo");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("Id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.UserId)
                .HasColumnName("UserId");

            builder.Property(x => x.Email)
                .HasColumnName("Email")
                .HasMaxLength(256)
                .IsUnicode()
                .IsRequired();

            builder.Property(x => x.Success)
                .HasColumnName("Success")
                .IsRequired();

            builder.Property(x => x.FailureReason)
                .HasColumnName("FailureReason")
                .HasMaxLength(200)
                .IsUnicode();

            builder.Property(x => x.IpAddress)
                .HasColumnName("IpAddress")
                .HasMaxLength(64)
                .IsUnicode();

            builder.Property(x => x.UserAgent)
                .HasColumnName("UserAgent")
                .HasMaxLength(256)
                .IsUnicode();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("CreatedAt")
                .HasColumnType("datetime2(7)")
                .HasDefaultValueSql("SYSUTCDATETIME()")
                .IsRequired();

            builder.HasIndex(x => new { x.Email, x.CreatedAt }); 
            builder.HasIndex(x => new { x.UserId, x.CreatedAt }); 
        }
    }
}
