namespace CodeJudge.Domain.Enums;


public enum SubmissionStatus : byte
{
    Queued = 1,
    Running = 2,
    AC = 3,
    WA = 4,
    TLE = 5,
    MLE = 6,
    RE = 7,
    CE = 8
}
