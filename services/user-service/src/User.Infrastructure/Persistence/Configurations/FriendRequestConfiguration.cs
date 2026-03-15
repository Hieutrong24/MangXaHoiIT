using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using User.Domain.Entities;
using User.Domain.Enums;

namespace User.Infrastructure.Persistence.Configurations;

public sealed class FriendRequestConfiguration : IEntityTypeConfiguration<FriendRequest>
{
    public void Configure(EntityTypeBuilder<FriendRequest> b)
    {
        b.ToTable("FriendRequests", "dbo");
        b.HasKey(x => x.RequestId);

        b.Property(x => x.RequestId).ValueGeneratedNever();
        b.Property(x => x.FromUserId).IsRequired();
        b.Property(x => x.ToUserId).IsRequired();

     
        b.Property(x => x.Status)
            .HasConversion<byte>()
            .HasColumnName("Status")
            .IsRequired()
            .HasDefaultValue(FriendRequestStatus.Pending);  

        b.Property(x => x.IsActive)
            .HasColumnName("IsActive")
            .IsRequired()
            .HasDefaultValue(true);

        b.Property(x => x.Message).HasMaxLength(200);

        b.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .HasDefaultValueSql("SYSUTCDATETIME()");

        b.Property(x => x.RespondedAt)
            .HasColumnName("RespondedAt");

        
        b.HasIndex(x => new { x.FromUserId, x.ToUserId })
            .HasDatabaseName("UX_FriendRequests_Active_From_To")
            .IsUnique()
            .HasFilter("[IsActive] = 1");

        b.HasIndex(x => new { x.ToUserId, x.Status, x.CreatedAt })
            .HasDatabaseName("IX_FriendRequests_ToUser_Status_CreatedAt");

        b.HasIndex(x => new { x.FromUserId, x.CreatedAt })
            .HasDatabaseName("IX_FriendRequests_FromUser_CreatedAt");
    }
}
