namespace User.Domain.ValueObjects;

public readonly record struct StudentCode(string Value)
{
    public static StudentCode Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("StudentCode is required.", nameof(value));
        value = value.Trim();
        if (value.Length > 20)
            throw new ArgumentException("StudentCode max length is 20.", nameof(value));
        return new StudentCode(value);
    }

    public override string ToString() => Value;
}
