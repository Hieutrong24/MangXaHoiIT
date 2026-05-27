using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using User.Domain.Entities;

namespace User.Infrastructure.Persistence.Configurations;

public sealed class UserSettingsConfiguration : IEntityTypeConfiguration<UserSettings>
{
    public void Configure(EntityTypeBuilder<UserSettings> b)
    {
        b.ToTable("UserSettings", "dbo");
        b.HasKey(x => x.UserId);

        b.Property(x => x.PrivacyLevel).HasDefaultValue((byte)1).IsRequired();
        b.Property(x => x.AllowDM).HasDefaultValue(true).IsRequired();
        b.Property(x => x.NotifyPrefsJson).HasColumnType("NVARCHAR(MAX)");
        b.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
    }
}
