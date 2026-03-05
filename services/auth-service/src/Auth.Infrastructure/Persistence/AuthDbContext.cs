using auth_service.src.Auth.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace auth_service.src.Auth.Infrastructure.Persistence
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }

        public DbSet<AuthAccount> AuthAccounts => Set<AuthAccount>();
        public DbSet<AuthRole> AuthRoles => Set<AuthRole>();
        public DbSet<AuthUserRole> AuthUserRoles => Set<AuthUserRole>();
        public DbSet<RefreshToken> AuthRefreshTokens => Set<RefreshToken>();
        public DbSet<LoginAuditLog> AuthLoginAuditLogs => Set<LoginAuditLog>();
        public DbSet<OutboxEvent> AuthOutboxEvents => Set<OutboxEvent>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AuthDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }
}
