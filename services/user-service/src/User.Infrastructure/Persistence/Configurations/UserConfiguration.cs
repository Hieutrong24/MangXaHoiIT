using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using User.Domain.Entities;
using User.Domain.Enums;
using User.Domain.ValueObjects;

using DomainUser = User.Domain.Entities.User;

namespace User.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<DomainUser>
{
    public void Configure(EntityTypeBuilder<DomainUser> b)
    {
        b.ToTable("Users", "dbo");
        b.HasKey(x => x.UserId);

        b.Property(x => x.UserId).ValueGeneratedNever();

        b.Property(x => x.StudentCode)
            .HasConversion(v => v.Value, v => StudentCode.Create(v))
            .HasColumnName("StudentCode")
            .HasMaxLength(20)
            .IsRequired();

        b.Property(x => x.Username).HasMaxLength(50).IsRequired();
        b.Property(x => x.FullName).HasMaxLength(120).IsRequired();

        b.Property(x => x.TDMUEmail)
            .HasConversion(
                v => v.HasValue ? v.Value.Value : null,
                v => v == null ? (TDMUEmail?)null : TDMUEmail.Create(v))
            .HasColumnName("TDMUEmail")
            .HasMaxLength(256);

        b.Property(x => x.Department).HasMaxLength(100);
        b.Property(x => x.Major).HasMaxLength(100);
        b.Property(x => x.ClassName).HasMaxLength(50);
        b.Property(x => x.EnrollmentYear);

        b.Property(x => x.AvatarUrl).HasMaxLength(500);
        b.Property(x => x.CoverUrl).HasMaxLength(500);
        b.Property(x => x.Bio).HasMaxLength(500);

        b.Property(x => x.Status)
            .HasConversion<byte>()
            .HasColumnName("Status")
            .IsRequired()
            .HasDefaultValue(UserStatus.Active);  


        b.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .HasDefaultValueSql("SYSUTCDATETIME()");

        b.Property(x => x.UpdatedAt)
            .HasColumnName("UpdatedAt")
            .HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasIndex(x => x.StudentCode).IsUnique().HasDatabaseName("UX_Users_StudentCode");
        b.HasIndex(x => x.Username).IsUnique().HasDatabaseName("UX_Users_Username");
        b.HasIndex(x => x.TDMUEmail).IsUnique().HasDatabaseName("UX_Users_TDMUEmail");
        b.HasIndex(x => x.Status).HasDatabaseName("IX_Users_Status");

        b.HasOne(x => x.Settings)
            .WithOne()
            .HasForeignKey<UserSettings>(x => x.UserId);

        b.HasMany(x => x.Links)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId);
    }
}
