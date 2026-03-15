using User.Application.Interfaces;
using User.Infrastructure.Outbox;
using User.Infrastructure.Persistence;

namespace User.Infrastructure.Repositories;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly UserDbContext _db;
    private readonly OutboxService _outbox;

    public UnitOfWork(UserDbContext db, OutboxService outbox)
    {
        _db = db;
        _outbox = outbox;
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        _outbox.AddDomainEventsToOutbox(_db);
        return _db.SaveChangesAsync(ct);
    }
}
