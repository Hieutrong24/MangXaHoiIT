namespace CodeJudge.Domain.ValueObjects;

public readonly record struct TimeLimit(int Milliseconds)
{
    public override string ToString() => $"{Milliseconds}ms";
}
