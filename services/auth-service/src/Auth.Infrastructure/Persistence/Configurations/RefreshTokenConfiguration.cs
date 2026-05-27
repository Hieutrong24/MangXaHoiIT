using auth_service.src.Auth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace auth_service.src.Auth.Infrastructure.Persistence.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("Auth_RefreshTokens", "dbo");
            builder.HasKey(x => x.TokenId);

            builder.Property(x => x.TokenId)
                .HasColumnName("TokenId");

            builder.Property(x => x.UserId)
                .HasColumnName("UserId")
                .IsRequired();

            builder.Property(x => x.TokenHash)
                .HasColumnName("TokenHash")
                .HasColumnType("binary(32)") // BINARY(32)
                .IsRequired();

            builder.Property(x => x.IssuedAt)
                .HasColumnName("IssuedAt")
                .HasColumnType("datetime2(7)")
                .IsRequired();

            builder.Property(x => x.ExpiresAt)
                .HasColumnName("ExpiresAt")
                .HasColumnType("datetime2(7)")
                .IsRequired();

            builder.Property(x => x.RevokedAt)
                .HasColumnName("RevokedAt")
                .HasColumnType("datetime2(7)");

            builder.Property(x => x.ReplacedByTokenId)
                .HasColumnName("ReplacedByTokenId");

            builder.Property(x => x.DeviceId)
                .HasColumnName("DeviceId")
                .HasMaxLength(128)
                .IsUnicode();

            builder.Property(x => x.IpAddress)
                .HasColumnName("IpAddress")
                .HasMaxLength(64)
                .IsUnicode();

            builder.Property(x => x.UserAgent)
                .HasColumnName("UserAgent")
                .HasMaxLength(256)
                .IsUnicode();

            builder.HasIndex(x => x.TokenHash).IsUnique();            // UX_Auth_RefreshTokens_TokenHash
            builder.HasIndex(x => new { x.UserId, x.ExpiresAt });     // IX_Auth_RefreshTokens_UserId_ExpiresAt
            builder.HasIndex(x => x.ExpiresAt);                       // IX_Auth_RefreshTokens_ExpiresAt
        }
    }
}
