using Microsoft.EntityFrameworkCore;
using User.Domain.Entities;
using User.Infrastructure.Outbox;
 
using DomainUser = User.Domain.Entities.User;

namespace User.Infrastructure.Persistence;

public sealed class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }

    public DbSet<DomainUser> Users => Set<DomainUser>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<UserLink> UserLinks => Set<UserLink>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<FriendRequest> FriendRequests => Set<FriendRequest>();
    public DbSet<Block> Blocks => Set<Block>();

    public DbSet<UserOutboxEvent> UserOutboxEvents => Set<UserOutboxEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
