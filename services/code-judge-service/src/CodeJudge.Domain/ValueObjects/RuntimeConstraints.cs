namespace CodeJudge.Domain.ValueObjects;

public readonly record struct RuntimeConstraints(int TimeLimitMs, int MemoryLimitMB);
