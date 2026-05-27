namespace CodeJudge.Domain.Entities;

public class Language
{
    public int LanguageId { get; set; } // identity
    public string Name { get; set; } = default!;    
    public string Compiler { get; set; } = default!; 
    public string? Version { get; set; }
    public bool IsEnabled { get; set; } = true;
}
