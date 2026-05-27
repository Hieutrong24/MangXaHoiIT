namespace User.Application.DTOs;

public sealed class UserLiteDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? AvatarUrl { get; set; }
    public string? ClassName { get; set; }
    public string? Major { get; set; }
    public double? SuggestionScore { get; set; }
    public IReadOnlyList<string>? SuggestionReasons { get; set; }
}
