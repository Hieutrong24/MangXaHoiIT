using System.Text.RegularExpressions;

namespace User.Domain.ValueObjects;

public readonly record struct TDMUEmail(string Value)
{
    private static readonly Regex EmailRx = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public static TDMUEmail Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email is empty.", nameof(value));
        value = value.Trim();
        if (value.Length > 256)
            throw new ArgumentException("Email max length is 256.", nameof(value));
        if (!EmailRx.IsMatch(value))
            throw new ArgumentException("Invalid email format.", nameof(value));
        return new TDMUEmail(value);
    }

    public override string ToString() => Value;
}
