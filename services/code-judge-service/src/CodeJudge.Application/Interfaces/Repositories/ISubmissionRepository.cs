using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface ISubmissionRepository
{
    Task AddAsync(Submission submission, CancellationToken ct = default);
    Task<Submission?> GetAsync(Guid submissionId, CancellationToken ct = default);
    Task<Submission?> GetWithDetailsAsync(Guid submissionId, CancellationToken ct = default);
    Task UpdateStatusAsync(Guid submissionId, SubmissionStatus status, string? compilerMessage, int? totalTimeMs, int? totalMemoryKb, int? score, CancellationToken ct = default);
}
