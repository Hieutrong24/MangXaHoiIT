using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface ISubmissionRepository
{
    Task AddAsync(Submission submission, CancellationToken ct = default);
    Task<List<Submission>> ListAsync(Guid? problemId = null, Guid? userId = null, SubmissionStatus? status = null, int limit = 100, CancellationToken ct = default);
    Task<Submission?> GetAsync(Guid submissionId, CancellationToken ct = default);
    Task<Submission?> GetWithDetailsAsync(Guid submissionId, CancellationToken ct = default);
    Task UpdateStatusAsync(Guid submissionId, SubmissionStatus status, string? compilerMessage, int? totalTimeMs, int? totalMemoryKb, decimal? score, CancellationToken ct = default);
}
