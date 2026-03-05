using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class LanguageRepository : ILanguageRepository
{
    private readonly JudgeDbContext _db;
    public LanguageRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(Language language, CancellationToken ct = default) => _db.Languages.AddAsync(language, ct).AsTask();

    public Task<Language?> GetAsync(int languageId, CancellationToken ct = default)
        => _db.Languages.AsNoTracking().FirstOrDefaultAsync(x => x.LanguageId == languageId, ct);

    public Task<Language?> GetByNameAsync(string name, CancellationToken ct = default)
        => _db.Languages.AsNoTracking().FirstOrDefaultAsync(x => x.Name == name, ct);

    public Task<List<Language>> ListAsync(CancellationToken ct = default)
        => _db.Languages.AsNoTracking().OrderBy(x => x.LanguageId).ToListAsync(ct);
}
