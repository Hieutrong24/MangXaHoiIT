using auth_service.src.Auth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace auth_service.src.Auth.Infrastructure.Persistence.Configurations
{
    public class AuthRoleConfiguration : IEntityTypeConfiguration<AuthRole>
    {
        public void Configure(EntityTypeBuilder<AuthRole> builder)
        {
            builder.ToTable("Auth_Roles", "dbo");
            builder.HasKey(x => x.RoleId);

            builder.Property(x => x.RoleId)
                .HasColumnName("RoleId")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.Name)
                .HasColumnName("Name")
                .HasMaxLength(50)
                .IsUnicode()
                .IsRequired();

            builder.Property(x => x.Description)
                .HasColumnName("Description")
                .HasMaxLength(200)
                .IsUnicode();

            builder.HasIndex(x => x.Name).IsUnique();
        }
    }
}
