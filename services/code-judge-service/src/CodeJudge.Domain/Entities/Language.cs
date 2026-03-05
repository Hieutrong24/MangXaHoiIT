namespace CodeJudge.Domain.Entities;

public class Language
{
    public int LanguageId { get; set; } // identity
    public string Name { get; set; } = default!;     // vĂ­ dá»¥: javascript, python, cpp, csharp
    public string Compiler { get; set; } = default!; // vĂ­ dá»¥: node, python3, g++, dotnet
    public string? Version { get; set; }
    public bool IsEnabled { get; set; } = true;
}
