using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface ILanguageService
{
    Task<List<LanguageDto>> ListAsync(CancellationToken ct = default);
    Task SeedDefaultAsync(CancellationToken ct = default);
}
