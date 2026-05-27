using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface ILanguageRepository
{
    Task<Language?> GetAsync(int languageId, CancellationToken ct = default);
    Task<Language?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<List<Language>> ListAsync(CancellationToken ct = default);
    Task AddAsync(Language language, CancellationToken ct = default);
}
