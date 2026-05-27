namespace CodeJudge.Infrastructure.Runners.Models;

public sealed record RunRequest(
    string LanguageName,
    string SourceCode,
    int TimeLimitMs,
    int MemoryLimitMb,
    IReadOnlyList<TestCaseRun> Tests
);

public sealed record TestCaseRun(int Index, string Input, string ExpectedOutput);
