namespace CodeJudge.Application.DTOs;

public sealed record LanguageDto(int LanguageId, string Name, string Compiler, string? Version, bool IsEnabled);
