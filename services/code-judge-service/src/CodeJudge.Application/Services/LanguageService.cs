using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Services;

public sealed class LanguageService : ILanguageService
{
    private readonly ILanguageRepository _langs;
    private readonly IUnitOfWork _uow;

    public LanguageService(ILanguageRepository langs, IUnitOfWork uow)
    {
        _langs = langs;
        _uow = uow;
    }

    public async Task<List<LanguageDto>> ListAsync(CancellationToken ct = default)
    {
        var list = await _langs.ListAsync(ct);
        return list.Select(x => new LanguageDto(x.LanguageId, x.Name, x.Compiler, x.Version, x.IsEnabled)).ToList();
    }

    public async Task SeedDefaultAsync(CancellationToken ct = default)
    {
        var existing = await _langs.ListAsync(ct);
        if (existing.Count > 0) return;

        var defaults = new[]
        {
            new Language { Name = "javascript", Compiler = "node", Version = "20", IsEnabled = true },
            new Language { Name = "python", Compiler = "python3", Version = "3", IsEnabled = true },
            new Language { Name = "cpp", Compiler = "g++", Version = "17", IsEnabled = true },
            new Language { Name = "csharp", Compiler = "dotnet", Version = "8", IsEnabled = true },
        };

        foreach (var l in defaults) await _langs.AddAsync(l, ct);
        await _uow.SaveChangesAsync(ct);
    }
}
