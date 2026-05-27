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
        var existingNames = existing
            .Select(x => x.Name?.Trim().ToLowerInvariant())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToHashSet();

        var defaults = new[]
        {
            new Language { Name = "javascript", Compiler = "node", Version = "20", IsEnabled = true },
            new Language { Name = "python", Compiler = "python3", Version = "3", IsEnabled = true },
            new Language { Name = "cpp", Compiler = "g++", Version = "17", IsEnabled = true },
            new Language { Name = "c", Compiler = "gcc", Version = "17", IsEnabled = true },
            new Language { Name = "java", Compiler = "javac", Version = "17", IsEnabled = true },
            new Language { Name = "go", Compiler = "go", Version = "1.22", IsEnabled = true },
            new Language { Name = "csharp", Compiler = "dotnet", Version = "8", IsEnabled = true },
        };

        var added = false;
        foreach (var l in defaults)
        {
            var normalized = l.Name.Trim().ToLowerInvariant();
            if (existingNames.Contains(normalized)) continue;
            await _langs.AddAsync(l, ct);
            existingNames.Add(normalized);
            added = true;
        }

        if (added)
            await _uow.SaveChangesAsync(ct);
    }
}
