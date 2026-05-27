using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> b)
    {
        b.ToTable("Judge_Languages");
        b.HasKey(x => x.LanguageId);

        b.Property(x => x.Name).HasMaxLength(50).IsRequired();
        b.Property(x => x.Compiler).HasMaxLength(50).IsRequired();
        b.Property(x => x.Version).HasMaxLength(50);
        b.Property(x => x.IsEnabled).HasDefaultValue(true);

        b.HasIndex(x => x.Name).IsUnique();
        b.HasIndex(x => x.IsEnabled);
    }
}
