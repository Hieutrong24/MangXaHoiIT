using User.Application.DTOs;
using DomainUser = User.Domain.Entities.User;

namespace User.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<DomainUser?> GetByIdAsync(Guid userId, CancellationToken ct = default);
    Task<DomainUser?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<bool> ExistsByIdAsync(Guid userId, CancellationToken ct = default);
    Task<bool> ExistsStudentCodeAsync(string studentCode, CancellationToken ct = default);
    Task<bool> ExistsUsernameAsync(string username, CancellationToken ct = default);
    Task<bool> ExistsEmailAsync(string email, CancellationToken ct = default);
    Task<List<User.Domain.Entities.User>> ListAllAsync(CancellationToken ct);
    Task<List<UserLiteQueryRow>> ListAllLiteAsync(CancellationToken ct = default);
    Task AddAsync(DomainUser user, CancellationToken ct = default);
}
