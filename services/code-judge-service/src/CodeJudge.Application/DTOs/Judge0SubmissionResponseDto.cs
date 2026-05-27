namespace CodeJudge.Application.DTOs;

public class Judge0SubmissionResponseDto
{
    public string? Token { get; set; }
    public string? Stdout { get; set; }
    public string? Stderr { get; set; }
    public string? CompileOutput { get; set; }
    public string? Message { get; set; }

    public Judge0StatusDto? Status { get; set; }

    public string? Time { get; set; }
    public int? Memory { get; set; }
}

public class Judge0StatusDto
{
    public int Id { get; set; }
    public string? Description { get; set; }
}