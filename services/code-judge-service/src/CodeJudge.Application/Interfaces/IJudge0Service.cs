using CodeJudge.Application.DTOs;
using static System.Net.Mime.MediaTypeNames;

using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface IJudge0Service
{
    Task<Judge0SubmissionResponseDto> SubmitAsync(Judge0RequestDto request, CancellationToken ct = default);
    Task<Judge0SubmissionResponseDto> GetResultAsync(string token, CancellationToken ct = default);
    Task<Judge0SubmissionResponseDto> RunAsync(Judge0RequestDto request, CancellationToken ct = default);
}