namespace CodeJudge.Domain.Enums;

// Map Ä‘Ăºng CHECK constraint Judge_Submissions.Status
// 1=queued,2=running,3=AC,4=WA,5=TLE,6=MLE,7=RE,8=CE
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
