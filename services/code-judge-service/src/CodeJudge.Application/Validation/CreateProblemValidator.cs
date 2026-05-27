namespace CodeJudge.Application.Validation;

public static class CreateProblemValidator
{
    public static void Validate(string title, string slug, byte difficulty, int timeLimitMs, int memoryLimitMb)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title required");
        if (difficulty < 1 || difficulty > 5) throw new ArgumentException("Difficulty must be 1..5");
        if (timeLimitMs < 100 || timeLimitMs > 60000) throw new ArgumentException("TimeLimitMs must be 100..60000");
        if (memoryLimitMb < 16 || memoryLimitMb > 4096) throw new ArgumentException("MemoryLimitMB must be 16..4096");
    }
}
