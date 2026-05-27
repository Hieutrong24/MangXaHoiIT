using auth_service.src.Auth.Domain.Entities;
using auth_service.src.Auth.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace auth_service.src.Auth.Infrastructure.Persistence.Configurations
{
    public class AuthAccountConfiguration : IEntityTypeConfiguration<AuthAccount>
    {
        public void Configure(EntityTypeBuilder<AuthAccount> builder)
        {
            builder.ToTable("Auth_Accounts", "dbo");
            builder.HasKey(x => x.UserId);

            
            builder.OwnsOne(x => x.Email, email =>
            {
                email.Property(e => e.Value)
                    .HasColumnName("Email")
                    .HasMaxLength(256)
                    .IsUnicode()
                    .IsRequired();

           
                email.WithOwner();
            });

           
            builder.OwnsOne(x => x.Password, pw =>
            {
                pw.Property(p => p.Hash)
                    .HasColumnName("PasswordHash")
                    .HasColumnType("varbinary(256)")
                    .IsRequired();

                pw.Property(p => p.Algorithm)
                    .HasColumnName("PasswordAlgo")
                    .HasMaxLength(50)
                    .IsUnicode()
                    .IsRequired();

                pw.WithOwner();
            });

            builder.Property(x => x.IsEmailVerified)
                .HasColumnName("IsEmailVerified")
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(x => x.Status)
                .HasColumnName("Status")
                .HasConversion<byte>() // TINYINT
                .HasDefaultValue(AccountStatus.Active)   
                .IsRequired();


            builder.Property(x => x.CreatedAt)
                .HasColumnName("CreatedAt")
                .HasColumnType("datetime2(7)")
                .HasDefaultValueSql("SYSUTCDATETIME()")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("UpdatedAt")
                .HasColumnType("datetime2(7)")
                .HasDefaultValueSql("SYSUTCDATETIME()")
                .IsRequired();

            builder.OwnsOne(x => x.Email, email =>
            {
                email.Property(e => e.Value)
                     .HasColumnName("Email")
                     .HasMaxLength(256)
                     .IsUnicode()
                     .IsRequired();

                
                email.HasIndex(e => e.Value)
                     .IsUnique()
                     .HasDatabaseName("UX_Auth_Accounts_Email");

                email.WithOwner();
            });


        }
    }
}
