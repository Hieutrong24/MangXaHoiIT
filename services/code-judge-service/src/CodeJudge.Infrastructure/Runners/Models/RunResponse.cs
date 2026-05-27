namespace CodeJudge.Infrastructure.Runners.Models;

public sealed record RunResponse(
    string Verdict,
    string? CompileLog,
    int TotalTimeMs,
    int PeakMemoryKb,
    IReadOnlyList<TestRunResult> Tests
);

public sealed record TestRunResult(int Index, string Verdict, int TimeMs, int MemoryKb, string? Stdout, string? Stderr);
