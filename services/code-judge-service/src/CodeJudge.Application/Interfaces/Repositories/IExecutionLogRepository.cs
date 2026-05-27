namespace CodeJudge.Application.Interfaces.Repositories;

// logs cháº¡y (stdout/stderr/compileLog...) lÆ°u Mongo cho nháº¹
public interface IExecutionLogRepository
{
    Task AppendAsync(Guid submissionId, string type, string content, CancellationToken ct = default);
}
