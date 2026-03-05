using CodeJudge.Domain.Enums;

namespace CodeJudge.Application.Services;

public static class VerdictCalculator
{
    public static SubmissionStatus ToSubmissionStatus(string verdict)
    {
        if (Enum.TryParse<SubmissionStatus>(verdict, true, out var s)) return s;
        return SubmissionStatus.RE;
    }

    // map per-test status in Judge_SubmissionTestResults
    public static byte ToTestResultStatus(string verdict)
    {
        // 1=pass,2=fail,3=TLE,4=MLE,5=RE,6=SKIP
        verdict = (verdict ?? "").ToUpperInvariant();
        return verdict switch
        {
            "AC" => 1,
            "WA" => 2,
            "TLE" => 3,
            "MLE" => 4,
            "RE" => 5,
            "CE" => 6,
            _ => 5
        };
    }
}
