using auth_service.src.Auth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace auth_service.src.Auth.Infrastructure.Persistence.Configurations
{
    public class UserRoleConfiguration : IEntityTypeConfiguration<AuthUserRole>
    {
        public void Configure(EntityTypeBuilder<AuthUserRole> builder)
        {
            builder.ToTable("Auth_UserRoles", "dbo");
            builder.HasKey(x => new { x.UserId, x.RoleId });

            builder.Property(x => x.AssignedAt)
                .HasColumnName("AssignedAt")
                .HasColumnType("datetime2(7)")
                .HasDefaultValueSql("SYSUTCDATETIME()")
                .IsRequired();

            builder.HasIndex(x => new { x.RoleId, x.UserId }); 
        }
    }
}
