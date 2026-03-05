namespace CodeJudge.Application.Interfaces;

public interface ICodeRunnerClient
{
    Task<RunnerRunResponse> RunAsync(RunnerRunRequest request, CancellationToken ct = default);
}

public sealed record RunnerTestCase(int Index, string Input, string ExpectedOutput);

public sealed record RunnerRunRequest(
    string LanguageName,
    string SourceCode,
    int TimeLimitMs,
    int MemoryLimitMb,
    IReadOnlyList<RunnerTestCase> Tests
);

public sealed record RunnerTestResult(
    int Index,
    string Verdict,
    int TimeMs,
    int MemoryKb,
    string? Stdout,
    string? Stderr
);

public sealed record RunnerRunResponse(
    string Verdict,
    string? CompileLog,
    int TotalTimeMs,
    int PeakMemoryKb,
    IReadOnlyList<RunnerTestResult> Tests
);
