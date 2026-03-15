using Microsoft.EntityFrameworkCore;
using User.Application.Interfaces.Repositories;
using User.Infrastructure.Persistence;
using User.Domain.ValueObjects;

 
using DomainUser = User.Domain.Entities.User;

namespace User.Infrastructure.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly UserDbContext _db;

    public UserRepository(UserDbContext db) => _db = db;

    public Task<DomainUser?> GetByIdAsync(Guid userId, CancellationToken ct = default) =>
        _db.Users
           .Include(x => x.Settings)
           .Include(x => x.Links)
           .FirstOrDefaultAsync(x => x.UserId == userId, ct);

    public Task<DomainUser?> GetByUsernameAsync(string username, CancellationToken ct = default) =>
        _db.Users.FirstOrDefaultAsync(x => x.Username == username, ct);

 
    public Task<bool> ExistsStudentCodeAsync(string studentCode, CancellationToken ct = default)
    {
        var sc = StudentCode.Create(studentCode);
        return _db.Users.AnyAsync(x => x.StudentCode == sc, ct);
    }

    public Task<bool> ExistsUsernameAsync(string username, CancellationToken ct = default) =>
        _db.Users.AnyAsync(x => x.Username == username, ct);

   
    public Task<bool> ExistsEmailAsync(string email, CancellationToken ct = default)
    {
        var em = TDMUEmail.Create(email);
        return _db.Users.AnyAsync(x => x.TDMUEmail.HasValue && x.TDMUEmail.Value == em, ct);
    }

    public Task AddAsync(DomainUser user, CancellationToken ct = default) =>
        _db.Users.AddAsync(user, ct).AsTask();
    public Task<List<DomainUser>> ListAllAsync(CancellationToken ct = default) =>
    _db.Users
       .AsNoTracking()
       .OrderByDescending(x => x.CreatedAt)
       .ToListAsync(ct);
}
