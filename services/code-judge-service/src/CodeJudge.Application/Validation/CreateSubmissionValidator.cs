namespace CodeJudge.Application.Validation;

public static class CreateSubmissionValidator
{
    public static void Validate(string sourceCode)
    {
        if (string.IsNullOrWhiteSpace(sourceCode)) throw new ArgumentException("SourceCode required");
        if (sourceCode.Length > 200_000) throw new ArgumentException("SourceCode too large");
    }
}
