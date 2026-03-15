namespace CodeJudge.Infrastructure.Runners;

public class Judge0Options
{
    public string BaseUrl { get; set; } = "https://ce.judge0.com";
    public string? ApiKey { get; set; }  
    public bool UseWait { get; set; } = true;
}