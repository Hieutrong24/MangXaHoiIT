using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface ISubmissionService
{
    Task<SubmissionDto> CreateAsync(CreateSubmissionRequest req, CancellationToken ct = default);
    Task<SubmissionDto?> GetAsync(Guid submissionId, CancellationToken ct = default);
    Task<JudgeResultDto?> GetResultAsync(Guid submissionId, CancellationToken ct = default);
    Task RejudgeAsync(Guid submissionId, CancellationToken ct = default);
    Task CancelAsync(Guid submissionId, CancellationToken ct = default);
}

public sealed record CreateSubmissionRequest(
    Guid ProblemId,
    Guid UserId,
    int LanguageId,
    string SourceCode
);
