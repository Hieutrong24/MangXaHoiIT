namespace CodeJudge.Domain.ValueObjects;

public readonly record struct MemoryLimit(int Megabytes)
{
    public override string ToString() => $"{Megabytes}MB";
}
