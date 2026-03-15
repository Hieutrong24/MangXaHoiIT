# ============================================
# Bootstrap full code for code-judge-service
# DB schema: JudgeDB (Judge_Problems, Judge_TestCases, Judge_Languages, Judge_Submissions, Judge_SubmissionTestResults, Judge_UserProblemStats, Judge_OutboxEvents)
# Run at: services\code-judge-service
# ============================================

$ErrorActionPreference = "Stop"

function Write-File([string]$rel, [string]$content) {
  $path = Join-Path $PSScriptRoot $rel
  $dir = Split-Path $path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  Set-Content -Path $path -Value $content -Encoding UTF8
}

function Touch([string]$rel) {
  $path = Join-Path $PSScriptRoot $rel
  $dir = Split-Path $path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  if (!(Test-Path $path)) { Set-Content -Path $path -Value "" -Encoding UTF8 }
}

# ---------------------------
# Ensure folders exist
# ---------------------------
$folders = @(
  "src/CodeJudge.API/Controllers",
  "src/CodeJudge.API/Middlewares",
  "src/CodeJudge.API/Extensions",
  "src/CodeJudge.Application/Interfaces/Repositories",
  "src/CodeJudge.Application/DTOs",
  "src/CodeJudge.Application/Features/Problems/Commands",
  "src/CodeJudge.Application/Features/Problems/Queries",
  "src/CodeJudge.Application/Features/TestCases/Commands",
  "src/CodeJudge.Application/Features/TestCases/Queries",
  "src/CodeJudge.Application/Features/Submissions/Commands",
  "src/CodeJudge.Application/Features/Submissions/Queries",
  "src/CodeJudge.Application/Services",
  "src/CodeJudge.Application/Common",
  "src/CodeJudge.Application/Validation",
  "src/CodeJudge.Domain/Entities",
  "src/CodeJudge.Domain/Enums",
  "src/CodeJudge.Domain/Events",
  "src/CodeJudge.Domain/ValueObjects",
  "src/CodeJudge.Infrastructure/Persistence/SqlServer/Configurations",
  "src/CodeJudge.Infrastructure/Persistence/Mongo/Documents",
  "src/CodeJudge.Infrastructure/Repositories/SqlServer",
  "src/CodeJudge.Infrastructure/Repositories/Mongo",
  "src/CodeJudge.Infrastructure/Runners/Models",
  "src/CodeJudge.Runner.Node/src/routes",
  "src/CodeJudge.Runner.Node/src/controllers",
  "src/CodeJudge.Runner.Node/src/services",
  "src/CodeJudge.Runner.Node/src/runners",
  "src/CodeJudge.Runner.Node/src/languages",
  "src/CodeJudge.Runner.Node/src/validators",
  "src/CodeJudge.Runner.Node/src/contracts",
  "src/CodeJudge.Runner.Node/src/utils",
  "src/CodeJudge.Runner.Node/src/config",
  "src/CodeJudge.Runner.Node/test"
)

foreach ($f in $folders) { if (!(Test-Path (Join-Path $PSScriptRoot $f))) { New-Item -ItemType Directory -Path (Join-Path $PSScriptRoot $f) | Out-Null } }

# ============================================
# DOMAIN
# ============================================

Write-File "src/CodeJudge.Domain/Enums/SubmissionStatus.cs" @'
namespace CodeJudge.Domain.Enums;

// Map đúng CHECK constraint Judge_Submissions.Status
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
'@

Write-File "src/CodeJudge.Domain/Enums/JudgeVerdict.cs" @'
namespace CodeJudge.Domain.Enums;

public enum JudgeVerdict : byte
{
    AC = 3,
    WA = 4,
    TLE = 5,
    MLE = 6,
    RE = 7,
    CE = 8
}
'@

Write-File "src/CodeJudge.Domain/Enums/ProblemStatus.cs" @'
namespace CodeJudge.Domain.Enums;

// Judge_Problems.Status: 1=Active,2=Hidden,3=Deleted
public enum ProblemStatus : byte
{
    Active = 1,
    Hidden = 2,
    Deleted = 3
}
'@

Write-File "src/CodeJudge.Domain/ValueObjects/TimeLimit.cs" @'
namespace CodeJudge.Domain.ValueObjects;

public readonly record struct TimeLimit(int Milliseconds)
{
    public override string ToString() => $"{Milliseconds}ms";
}
'@

Write-File "src/CodeJudge.Domain/ValueObjects/MemoryLimit.cs" @'
namespace CodeJudge.Domain.ValueObjects;

public readonly record struct MemoryLimit(int Megabytes)
{
    public override string ToString() => $"{Megabytes}MB";
}
'@

Write-File "src/CodeJudge.Domain/ValueObjects/RuntimeConstraints.cs" @'
namespace CodeJudge.Domain.ValueObjects;

public readonly record struct RuntimeConstraints(int TimeLimitMs, int MemoryLimitMB);
'@

Write-File "src/CodeJudge.Domain/Entities/Problem.cs" @'
using CodeJudge.Domain.Enums;

namespace CodeJudge.Domain.Entities;

public class Problem
{
    public Guid ProblemId { get; set; }
    public string Title { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public byte Difficulty { get; set; } // 1..5
    public int TimeLimitMs { get; set; }
    public int MemoryLimitMB { get; set; }
    public string Statement { get; set; } = default!;
    public Guid CreatedByUserId { get; set; }
    public bool IsPublic { get; set; } = true;
    public ProblemStatus Status { get; set; } = ProblemStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
}
'@

Write-File "src/CodeJudge.Domain/Entities/TestCase.cs" @'
namespace CodeJudge.Domain.Entities;

public class TestCase
{
    public Guid TestCaseId { get; set; }
    public Guid ProblemId { get; set; }
    public Problem? Problem { get; set; }

    public byte[] InputData { get; set; } = default!;
    public byte[] OutputData { get; set; } = default!;
    public bool IsSample { get; set; }
    public int Score { get; set; }
    public int OrderNo { get; set; }
}
'@

Write-File "src/CodeJudge.Domain/Entities/Language.cs" @'
namespace CodeJudge.Domain.Entities;

public class Language
{
    public int LanguageId { get; set; } // identity
    public string Name { get; set; } = default!;     // ví dụ: javascript, python, cpp, csharp
    public string Compiler { get; set; } = default!; // ví dụ: node, python3, g++, dotnet
    public string? Version { get; set; }
    public bool IsEnabled { get; set; } = true;
}
'@

Write-File "src/CodeJudge.Domain/Entities/Submission.cs" @'
using CodeJudge.Domain.Enums;

namespace CodeJudge.Domain.Entities;

public class Submission
{
    public Guid SubmissionId { get; set; }
    public Guid ProblemId { get; set; }
    public Problem? Problem { get; set; }

    public Guid UserId { get; set; }
    public int LanguageId { get; set; }
    public Language? Language { get; set; }

    public string SourceCode { get; set; } = default!;
    public byte[] CodeHash { get; set; } = default!; // 32 bytes (SHA-256)
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public SubmissionStatus Status { get; set; } = SubmissionStatus.Queued;

    public int? TotalTimeMs { get; set; }
    public int? TotalMemoryKB { get; set; }
    public int? Score { get; set; }
    public string? CompilerMessage { get; set; }

    public ICollection<JudgeResult> TestResults { get; set; } = new List<JudgeResult>();
}
'@

Write-File "src/CodeJudge.Domain/Entities/JudgeResult.cs" @'
namespace CodeJudge.Domain.Entities;

// Map bảng Judge_SubmissionTestResults
public class JudgeResult
{
    public long Id { get; set; } // identity
    public Guid SubmissionId { get; set; }
    public Submission? Submission { get; set; }

    public Guid TestCaseId { get; set; }
    public TestCase? TestCase { get; set; }

    // 1=pass,2=fail,3=TLE,4=MLE,5=RE,6=SKIP
    public byte Status { get; set; }
    public int TimeMs { get; set; }
    public int MemoryKB { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
'@

Write-File "src/CodeJudge.Domain/Entities/UserProblemStat.cs" @'
namespace CodeJudge.Domain.Entities;

public class UserProblemStat
{
    public Guid UserId { get; set; }
    public Guid ProblemId { get; set; }
    public Problem? Problem { get; set; }

    public byte BestStatus { get; set; } // same as Judge_Submissions.Status
    public int? BestTimeMs { get; set; }
    public int? BestMemoryKB { get; set; }
    public int Attempts { get; set; }
    public DateTime LastSubmittedAt { get; set; }
    public DateTime? FirstAcceptedAt { get; set; }
}
'@

Write-File "src/CodeJudge.Domain/Entities/OutboxEvent.cs" @'
namespace CodeJudge.Domain.Entities;

public class OutboxEvent
{
    public Guid EventId { get; set; }
    public Guid AggregateId { get; set; }
    public string EventType { get; set; } = default!;
    public string PayloadJson { get; set; } = default!;
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public string? TraceId { get; set; }
}
'@

Write-File "src/CodeJudge.Domain/Events/SubmissionCreatedDomainEvent.cs" @'
namespace CodeJudge.Domain.Events;

public record SubmissionCreatedDomainEvent(Guid SubmissionId, Guid ProblemId, Guid UserId);
'@

Write-File "src/CodeJudge.Domain/Events/SubmissionJudgedDomainEvent.cs" @'
namespace CodeJudge.Domain.Events;

public record SubmissionJudgedDomainEvent(Guid SubmissionId, string Verdict, int? TotalTimeMs, int? TotalMemoryKB, int? Score);
'@

# ============================================
# APPLICATION
# ============================================

Write-File "src/CodeJudge.Application/Common/Result.cs" @'
namespace CodeJudge.Application.Common;

public sealed record Result(bool IsSuccess, string? Error)
{
    public static Result Ok() => new(true, null);
    public static Result Fail(string error) => new(false, error);
}

public sealed record Result<T>(bool IsSuccess, T? Value, string? Error)
{
    public static Result<T> Ok(T value) => new(true, value, null);
    public static Result<T> Fail(string error) => new(false, default, error);
}
'@

Write-File "src/CodeJudge.Application/Common/PagedResult.cs" @'
namespace CodeJudge.Application.Common;

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);
'@

Write-File "src/CodeJudge.Application/Common/Errors.cs" @'
namespace CodeJudge.Application.Common;

public static class Errors
{
    public const string NotFound = "NOT_FOUND";
    public const string Invalid = "INVALID";
    public const string Conflict = "CONFLICT";
}
'@

Write-File "src/CodeJudge.Application/Interfaces/IUnitOfWork.cs" @'
namespace CodeJudge.Application.Interfaces;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
'@

Write-File "src/CodeJudge.Application/Interfaces/ICodeRunnerClient.cs" @'
namespace CodeJudge.Application.Interfaces;

public interface ICodeRunnerClient
{
    Task<RunnerRunResponse> RunAsync(RunnerRunRequest request, CancellationToken ct = default);
}

public sealed record RunnerTestCase(int Index, string Input, string ExpectedOutput);

public sealed record RunnerRunRequest(
    string LanguageName,
    string SourceCode,
    int TimeLimitMs,
    int MemoryLimitMb,
    IReadOnlyList<RunnerTestCase> Tests
);

public sealed record RunnerTestResult(
    int Index,
    string Verdict,
    int TimeMs,
    int MemoryKb,
    string? Stdout,
    string? Stderr
);

public sealed record RunnerRunResponse(
    string Verdict,
    string? CompileLog,
    int TotalTimeMs,
    int PeakMemoryKb,
    IReadOnlyList<RunnerTestResult> Tests
);
'@

Write-File "src/CodeJudge.Application/Interfaces/IJudgeQueue.cs" @'
namespace CodeJudge.Application.Interfaces;

public interface IJudgeQueue
{
    ValueTask EnqueueAsync(Guid submissionId, CancellationToken ct = default);
    IAsyncEnumerable<Guid> DequeueAllAsync(CancellationToken ct = default);
}
'@

# Repositories
Write-File "src/CodeJudge.Application/Interfaces/Repositories/IProblemRepository.cs" @'
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface IProblemRepository
{
    Task<Problem?> GetAsync(Guid problemId, CancellationToken ct = default);
    Task<List<Problem>> ListAsync(CancellationToken ct = default);
    Task AddAsync(Problem problem, CancellationToken ct = default);
    void Update(Problem problem);
}
'@

Write-File "src/CodeJudge.Application/Interfaces/Repositories/ITestCaseRepository.cs" @'
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface ITestCaseRepository
{
    Task<List<TestCase>> ListByProblemAsync(Guid problemId, CancellationToken ct = default);
    Task AddAsync(TestCase testCase, CancellationToken ct = default);
    Task<TestCase?> GetAsync(Guid testCaseId, CancellationToken ct = default);
    void Remove(TestCase testCase);
}
'@

Write-File "src/CodeJudge.Application/Interfaces/Repositories/ILanguageRepository.cs" @'
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface ILanguageRepository
{
    Task<Language?> GetAsync(int languageId, CancellationToken ct = default);
    Task<Language?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<List<Language>> ListAsync(CancellationToken ct = default);
    Task AddAsync(Language language, CancellationToken ct = default);
}
'@

Write-File "src/CodeJudge.Application/Interfaces/Repositories/ISubmissionRepository.cs" @'
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
'@

Write-File "src/CodeJudge.Application/Interfaces/Repositories/IJudgeResultRepository.cs" @'
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface IJudgeResultRepository
{
    Task DeleteBySubmissionAsync(Guid submissionId, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<JudgeResult> results, CancellationToken ct = default);
    Task<List<JudgeResult>> ListBySubmissionAsync(Guid submissionId, CancellationToken ct = default);
}
'@

Write-File "src/CodeJudge.Application/Interfaces/Repositories/IExecutionLogRepository.cs" @'
namespace CodeJudge.Application.Interfaces.Repositories;

// logs chạy (stdout/stderr/compileLog...) lưu Mongo cho nhẹ
public interface IExecutionLogRepository
{
    Task AppendAsync(Guid submissionId, string type, string content, CancellationToken ct = default);
}
'@

Write-File "src/CodeJudge.Application/DTOs/ProblemDto.cs" @'
namespace CodeJudge.Application.DTOs;

public sealed record ProblemDto(
    Guid ProblemId,
    string Title,
    string Slug,
    byte Difficulty,
    int TimeLimitMs,
    int MemoryLimitMB,
    bool IsPublic,
    byte Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
'@

Write-File "src/CodeJudge.Application/DTOs/TestCaseDto.cs" @'
namespace CodeJudge.Application.DTOs;

public sealed record TestCaseDto(
    Guid TestCaseId,
    Guid ProblemId,
    int OrderNo,
    bool IsSample,
    int Score,
    string InputText,
    string OutputText
);
'@

Write-File "src/CodeJudge.Application/DTOs/LanguageDto.cs" @'
namespace CodeJudge.Application.DTOs;

public sealed record LanguageDto(int LanguageId, string Name, string Compiler, string? Version, bool IsEnabled);
'@

Write-File "src/CodeJudge.Application/DTOs/SubmissionDto.cs" @'
namespace CodeJudge.Application.DTOs;

public sealed record SubmissionDto(
    Guid SubmissionId,
    Guid ProblemId,
    Guid UserId,
    int LanguageId,
    string LanguageName,
    byte Status,
    DateTime SubmittedAt,
    int? TotalTimeMs,
    int? TotalMemoryKB,
    int? Score,
    string? CompilerMessage
);
'@

Write-File "src/CodeJudge.Application/DTOs/JudgeResultDto.cs" @'
namespace CodeJudge.Application.DTOs;

public sealed record JudgeTestResultDto(
    Guid TestCaseId,
    int OrderNo,
    byte Status,
    int TimeMs,
    int MemoryKB,
    string? ErrorMessage
);

public sealed record JudgeResultDto(
    Guid SubmissionId,
    string Verdict,
    int TotalTimeMs,
    int PeakMemoryKB,
    int? Score,
    string? CompileLog,
    IReadOnlyList<JudgeTestResultDto> Tests
);
'@

# Services contracts
Write-File "src/CodeJudge.Application/Interfaces/IProblemService.cs" @'
using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface IProblemService
{
    Task<ProblemDto> CreateAsync(CreateProblemRequest req, CancellationToken ct = default);
    Task<List<ProblemDto>> ListAsync(CancellationToken ct = default);
    Task<ProblemDto?> GetAsync(Guid id, CancellationToken ct = default);
}

public sealed record CreateProblemRequest(
    string Title,
    string Slug,
    byte Difficulty,
    int TimeLimitMs,
    int MemoryLimitMB,
    string Statement,
    Guid CreatedByUserId,
    bool IsPublic
);
'@

Write-File "src/CodeJudge.Application/Interfaces/ITestCaseService.cs" @'
using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface ITestCaseService
{
    Task<TestCaseDto> CreateAsync(CreateTestCaseRequest req, CancellationToken ct = default);
    Task<List<TestCaseDto>> ListByProblemAsync(Guid problemId, CancellationToken ct = default);
}

public sealed record CreateTestCaseRequest(
    Guid ProblemId,
    int OrderNo,
    bool IsSample,
    int Score,
    string InputText,
    string OutputText
);
'@

Write-File "src/CodeJudge.Application/Interfaces/ILanguageService.cs" @'
using CodeJudge.Application.DTOs;

namespace CodeJudge.Application.Interfaces;

public interface ILanguageService
{
    Task<List<LanguageDto>> ListAsync(CancellationToken ct = default);
    Task SeedDefaultAsync(CancellationToken ct = default);
}
'@

Write-File "src/CodeJudge.Application/Interfaces/ISubmissionService.cs" @'
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
'@

# Helper: hashing + encoding
Write-File "src/CodeJudge.Application/Services/Helpers.cs" @'
using System.Security.Cryptography;
using System.Text;

namespace CodeJudge.Application.Services;

public static class Helpers
{
    public static byte[] Sha256(string text)
    {
        var bytes = Encoding.UTF8.GetBytes(text);
        return SHA256.HashData(bytes);
    }

    public static byte[] ToBytesUtf8(string s) => Encoding.UTF8.GetBytes(s ?? "");
    public static string FromBytesUtf8(byte[] b) => Encoding.UTF8.GetString(b ?? Array.Empty<byte>());
}
'@

Write-File "src/CodeJudge.Application/Services/VerdictCalculator.cs" @'
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
'@

Write-File "src/CodeJudge.Application/Services/ProblemService.cs" @'
using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;

namespace CodeJudge.Application.Services;

public sealed class ProblemService : IProblemService
{
    private readonly IProblemRepository _problems;
    private readonly IUnitOfWork _uow;

    public ProblemService(IProblemRepository problems, IUnitOfWork uow)
    {
        _problems = problems;
        _uow = uow;
    }

    public async Task<ProblemDto> CreateAsync(CreateProblemRequest req, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var p = new Problem
        {
            ProblemId = Guid.NewGuid(),
            Title = req.Title.Trim(),
            Slug = string.IsNullOrWhiteSpace(req.Slug) ? Slugify(req.Title) : req.Slug.Trim(),
            Difficulty = req.Difficulty,
            TimeLimitMs = req.TimeLimitMs,
            MemoryLimitMB = req.MemoryLimitMB,
            Statement = req.Statement,
            CreatedByUserId = req.CreatedByUserId,
            IsPublic = req.IsPublic,
            Status = ProblemStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _problems.AddAsync(p, ct);
        await _uow.SaveChangesAsync(ct);

        return ToDto(p);
    }

    public async Task<ProblemDto?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _problems.GetAsync(id, ct);
        return p is null ? null : ToDto(p);
    }

    public async Task<List<ProblemDto>> ListAsync(CancellationToken ct = default)
    {
        var list = await _problems.ListAsync(ct);
        return list.Select(ToDto).ToList();
    }

    private static ProblemDto ToDto(Problem p) =>
        new(p.ProblemId, p.Title, p.Slug, p.Difficulty, p.TimeLimitMs, p.MemoryLimitMB, p.IsPublic, (byte)p.Status, p.CreatedAt, p.UpdatedAt);

    private static string Slugify(string s)
    {
        s = (s ?? "").Trim().ToLowerInvariant();
        s = System.Text.RegularExpressions.Regex.Replace(s, @"\s+", "-");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"[^a-z0-9\-]", "");
        return string.IsNullOrWhiteSpace(s) ? Guid.NewGuid().ToString("N") : s;
    }
}
'@

Write-File "src/CodeJudge.Application/Services/TestCaseService.cs" @'
using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Services;

public sealed class TestCaseService : ITestCaseService
{
    private readonly IProblemRepository _problems;
    private readonly ITestCaseRepository _testCases;
    private readonly IUnitOfWork _uow;

    public TestCaseService(IProblemRepository problems, ITestCaseRepository testCases, IUnitOfWork uow)
    {
        _problems = problems;
        _testCases = testCases;
        _uow = uow;
    }

    public async Task<TestCaseDto> CreateAsync(CreateTestCaseRequest req, CancellationToken ct = default)
    {
        var p = await _problems.GetAsync(req.ProblemId, ct);
        if (p is null) throw new InvalidOperationException("Problem not found.");

        var tc = new TestCase
        {
            TestCaseId = Guid.NewGuid(),
            ProblemId = req.ProblemId,
            OrderNo = req.OrderNo,
            IsSample = req.IsSample,
            Score = req.Score,
            InputData = Helpers.ToBytesUtf8(req.InputText),
            OutputData = Helpers.ToBytesUtf8(req.OutputText)
        };

        await _testCases.AddAsync(tc, ct);
        await _uow.SaveChangesAsync(ct);

        return new TestCaseDto(tc.TestCaseId, tc.ProblemId, tc.OrderNo, tc.IsSample, tc.Score, req.InputText, req.OutputText);
    }

    public async Task<List<TestCaseDto>> ListByProblemAsync(Guid problemId, CancellationToken ct = default)
    {
        var list = await _testCases.ListByProblemAsync(problemId, ct);
        return list.OrderBy(x => x.OrderNo).Select(tc =>
            new TestCaseDto(tc.TestCaseId, tc.ProblemId, tc.OrderNo, tc.IsSample, tc.Score, Helpers.FromBytesUtf8(tc.InputData), Helpers.FromBytesUtf8(tc.OutputData))
        ).ToList();
    }
}
'@

Write-File "src/CodeJudge.Application/Services/LanguageService.cs" @'
using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Services;

public sealed class LanguageService : ILanguageService
{
    private readonly ILanguageRepository _langs;
    private readonly IUnitOfWork _uow;

    public LanguageService(ILanguageRepository langs, IUnitOfWork uow)
    {
        _langs = langs;
        _uow = uow;
    }

    public async Task<List<LanguageDto>> ListAsync(CancellationToken ct = default)
    {
        var list = await _langs.ListAsync(ct);
        return list.Select(x => new LanguageDto(x.LanguageId, x.Name, x.Compiler, x.Version, x.IsEnabled)).ToList();
    }

    public async Task SeedDefaultAsync(CancellationToken ct = default)
    {
        var existing = await _langs.ListAsync(ct);
        if (existing.Count > 0) return;

        var defaults = new[]
        {
            new Language { Name = "javascript", Compiler = "node", Version = "20", IsEnabled = true },
            new Language { Name = "python", Compiler = "python3", Version = "3", IsEnabled = true },
            new Language { Name = "cpp", Compiler = "g++", Version = "17", IsEnabled = true },
            new Language { Name = "csharp", Compiler = "dotnet", Version = "8", IsEnabled = true },
        };

        foreach (var l in defaults) await _langs.AddAsync(l, ct);
        await _uow.SaveChangesAsync(ct);
    }
}
'@

Write-File "src/CodeJudge.Application/Services/SubmissionService.cs" @'
using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;

namespace CodeJudge.Application.Services;

public sealed class SubmissionService : ISubmissionService
{
    private readonly ISubmissionRepository _subs;
    private readonly IProblemRepository _problems;
    private readonly ILanguageRepository _langs;
    private readonly IJudgeQueue _queue;
    private readonly IUnitOfWork _uow;
    private readonly IJudgeResultRepository _results;

    public SubmissionService(
        ISubmissionRepository subs,
        IProblemRepository problems,
        ILanguageRepository langs,
        IJudgeQueue queue,
        IJudgeResultRepository results,
        IUnitOfWork uow)
    {
        _subs = subs;
        _problems = problems;
        _langs = langs;
        _queue = queue;
        _uow = uow;
        _results = results;
    }

    public async Task<SubmissionDto> CreateAsync(CreateSubmissionRequest req, CancellationToken ct = default)
    {
        var p = await _problems.GetAsync(req.ProblemId, ct);
        if (p is null) throw new InvalidOperationException("Problem not found.");

        var lang = await _langs.GetAsync(req.LanguageId, ct);
        if (lang is null || !lang.IsEnabled) throw new InvalidOperationException("Language not supported.");

        var sub = new Submission
        {
            SubmissionId = Guid.NewGuid(),
            ProblemId = req.ProblemId,
            UserId = req.UserId,
            LanguageId = req.LanguageId,
            SourceCode = req.SourceCode,
            CodeHash = Helpers.Sha256(req.SourceCode),
            SubmittedAt = DateTime.UtcNow,
            Status = SubmissionStatus.Queued
        };

        await _subs.AddAsync(sub, ct);
        await _uow.SaveChangesAsync(ct);

        await _queue.EnqueueAsync(sub.SubmissionId, ct);

        return new SubmissionDto(sub.SubmissionId, sub.ProblemId, sub.UserId, sub.LanguageId, lang.Name, (byte)sub.Status, sub.SubmittedAt, null, null, null, null);
    }

    public async Task<SubmissionDto?> GetAsync(Guid submissionId, CancellationToken ct = default)
    {
        var sub = await _subs.GetAsync(submissionId, ct);
        if (sub is null) return null;

        var lang = await _langs.GetAsync(sub.LanguageId, ct);
        return new SubmissionDto(
            sub.SubmissionId, sub.ProblemId, sub.UserId, sub.LanguageId, lang?.Name ?? "unknown",
            (byte)sub.Status, sub.SubmittedAt, sub.TotalTimeMs, sub.TotalMemoryKB, sub.Score, sub.CompilerMessage
        );
    }

    public async Task<JudgeResultDto?> GetResultAsync(Guid submissionId, CancellationToken ct = default)
    {
        var sub = await _subs.GetWithDetailsAsync(submissionId, ct);
        if (sub is null) return null;

        var tests = await _results.ListBySubmissionAsync(submissionId, ct);

        // Verdict = theo Submission.Status
        var verdict = sub.Status.ToString();

        // PeakMemory = max memory of tests
        var peak = tests.Count == 0 ? 0 : tests.Max(x => x.MemoryKB);

        // OrderNo lấy từ TestCase navigation nếu có
        var items = tests.Select(t => new JudgeTestResultDto(
            t.TestCaseId,
            t.TestCase?.OrderNo ?? 0,
            t.Status,
            t.TimeMs,
            t.MemoryKB,
            t.ErrorMessage
        )).OrderBy(x => x.OrderNo).ToList();

        return new JudgeResultDto(sub.SubmissionId, verdict, sub.TotalTimeMs ?? 0, peak, sub.Score, sub.CompilerMessage, items);
    }

    public async Task RejudgeAsync(Guid submissionId, CancellationToken ct = default)
    {
        // reset: delete old test results, set queued
        await _results.DeleteBySubmissionAsync(submissionId, ct);
        await _subs.UpdateStatusAsync(submissionId, SubmissionStatus.Queued, null, null, null, null, ct);
        await _uow.SaveChangesAsync(ct);
        await _queue.EnqueueAsync(submissionId, ct);
    }

    public async Task CancelAsync(Guid submissionId, CancellationToken ct = default)
    {
        // DB không có Cancel status -> set RE và message Cancelled
        await _subs.UpdateStatusAsync(submissionId, SubmissionStatus.RE, "Cancelled", null, null, null, ct);
        await _uow.SaveChangesAsync(ct);
    }
}
'@

Write-File "src/CodeJudge.Application/Services/JudgeOrchestrator.cs" @'
using System.Text.Json;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;

namespace CodeJudge.Application.Services;

public sealed class JudgeOrchestrator
{
    private readonly ISubmissionRepository _subs;
    private readonly IProblemRepository _problems;
    private readonly ITestCaseRepository _testCases;
    private readonly ILanguageRepository _langs;
    private readonly IJudgeResultRepository _results;
    private readonly IExecutionLogRepository _logs;
    private readonly IUnitOfWork _uow;
    private readonly ICodeRunnerClient _runner;
    private readonly IOutboxRepository _outbox;
    private readonly IUserProblemStatRepository _stats;

    public JudgeOrchestrator(
        ISubmissionRepository subs,
        IProblemRepository problems,
        ITestCaseRepository testCases,
        ILanguageRepository langs,
        IJudgeResultRepository results,
        IExecutionLogRepository logs,
        IUserProblemStatRepository stats,
        IOutboxRepository outbox,
        ICodeRunnerClient runner,
        IUnitOfWork uow)
    {
        _subs = subs;
        _problems = problems;
        _testCases = testCases;
        _langs = langs;
        _results = results;
        _logs = logs;
        _stats = stats;
        _outbox = outbox;
        _runner = runner;
        _uow = uow;
    }

    public async Task JudgeAsync(Guid submissionId, CancellationToken ct = default)
    {
        var sub = await _subs.GetAsync(submissionId, ct);
        if (sub is null) return;
        if (sub.Status != SubmissionStatus.Queued) return;

        await _subs.UpdateStatusAsync(submissionId, SubmissionStatus.Running, null, null, null, null, ct);
        await _uow.SaveChangesAsync(ct);

        try
        {
            var problem = await _problems.GetAsync(sub.ProblemId, ct) ?? throw new InvalidOperationException("Problem not found");
            var lang = await _langs.GetAsync(sub.LanguageId, ct) ?? throw new InvalidOperationException("Language not found");
            if (!lang.IsEnabled) throw new InvalidOperationException("Language disabled");

            var tcs = await _testCases.ListByProblemAsync(sub.ProblemId, ct);
            if (tcs.Count == 0) throw new InvalidOperationException("No testcases configured");

            var runnerReq = new RunnerRunRequest(
                LanguageName: lang.Name,
                SourceCode: sub.SourceCode,
                TimeLimitMs: problem.TimeLimitMs,
                MemoryLimitMb: problem.MemoryLimitMB,
                Tests: tcs.OrderBy(x => x.OrderNo).Select((x, i) =>
                    new RunnerTestCase(i + 1, Helpers.FromBytesUtf8(x.InputData), Helpers.FromBytesUtf8(x.OutputData))
                ).ToList()
            );

            var runnerResp = await _runner.RunAsync(runnerReq, ct);

            // compile log -> Mongo
            if (!string.IsNullOrWhiteSpace(runnerResp.CompileLog))
                await _logs.AppendAsync(submissionId, "compile", runnerResp.CompileLog!, ct);

            // delete old results (if any)
            await _results.DeleteBySubmissionAsync(submissionId, ct);

            // build per-test result rows
            var tcByIndex = tcs.OrderBy(x => x.OrderNo).Select((x, i) => new { idx = i + 1, tc = x }).ToDictionary(x => x.idx, x => x.tc);

            var rows = new List<JudgeResult>();
            foreach (var tr in runnerResp.Tests)
            {
                if (!tcByIndex.TryGetValue(tr.Index, out var tcRow)) continue;
                rows.Add(new JudgeResult
                {
                    SubmissionId = submissionId,
                    TestCaseId = tcRow.TestCaseId,
                    Status = VerdictCalculator.ToTestResultStatus(tr.Verdict),
                    TimeMs = tr.TimeMs,
                    MemoryKB = tr.MemoryKb,
                    ErrorMessage = tr.Stderr
                });

                if (!string.IsNullOrWhiteSpace(tr.Stderr))
                    await _logs.AppendAsync(submissionId, $"stderr:test{tr.Index}", tr.Stderr!, ct);
            }

            await _results.AddRangeAsync(rows, ct);

            // scoring: if tc.Score all 0 => mỗi test pass = 1
            var allZero = tcs.All(x => x.Score == 0);
            int score = 0;
            foreach (var r in rows)
            {
                if (r.Status == 1) // pass
                {
                    var tc = tcs.First(x => x.TestCaseId == r.TestCaseId);
                    score += allZero ? 1 : Math.Max(0, tc.Score);
                }
            }

            var finalStatus = VerdictCalculator.ToSubmissionStatus(runnerResp.Verdict);
            await _subs.UpdateStatusAsync(
                submissionId,
                finalStatus,
                runnerResp.CompileLog,
                runnerResp.TotalTimeMs,
                runnerResp.PeakMemoryKb,
                score,
                ct
            );

            // update stats + outbox
            await _stats.UpsertAsync(sub.UserId, sub.ProblemId, (byte)finalStatus, runnerResp.TotalTimeMs, runnerResp.PeakMemoryKb, score, sub.SubmittedAt, ct);
            await _outbox.AddAsync(new OutboxCreate(
                AggregateId: submissionId,
                EventType: "Judge.SubmissionJudged",
                PayloadJson: JsonSerializer.Serialize(new
                {
                    submissionId,
                    verdict = finalStatus.ToString(),
                    totalTimeMs = runnerResp.TotalTimeMs,
                    totalMemoryKb = runnerResp.PeakMemoryKb,
                    score
                })
            ), ct);

            await _uow.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            await _logs.AppendAsync(submissionId, "system", ex.ToString(), ct);
            await _subs.UpdateStatusAsync(submissionId, SubmissionStatus.RE, ex.Message, null, null, null, ct);
            await _uow.SaveChangesAsync(ct);
        }
    }
}
'@

# Outbox + Stats repositories (Application interfaces)
Write-File "src/CodeJudge.Application/Interfaces/Repositories/IOutboxRepository.cs" @'
using CodeJudge.Domain.Entities;

namespace CodeJudge.Application.Interfaces.Repositories;

public interface IOutboxRepository
{
    Task AddAsync(OutboxCreate req, CancellationToken ct = default);
}

public sealed record OutboxCreate(Guid AggregateId, string EventType, string PayloadJson);
'@

Write-File "src/CodeJudge.Application/Interfaces/Repositories/IUserProblemStatRepository.cs" @'
namespace CodeJudge.Application.Interfaces.Repositories;

public interface IUserProblemStatRepository
{
    Task UpsertAsync(
        Guid userId,
        Guid problemId,
        byte submissionStatus,
        int? totalTimeMs,
        int? totalMemoryKb,
        int score,
        DateTime submittedAt,
        CancellationToken ct = default
    );
}
'@

# Validation stubs (compile OK)
Write-File "src/CodeJudge.Application/Validation/CreateProblemValidator.cs" @'
namespace CodeJudge.Application.Validation;

public static class CreateProblemValidator
{
    public static void Validate(string title, string slug, byte difficulty, int timeLimitMs, int memoryLimitMb)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title required");
        if (difficulty < 1 || difficulty > 5) throw new ArgumentException("Difficulty must be 1..5");
        if (timeLimitMs < 100 || timeLimitMs > 60000) throw new ArgumentException("TimeLimitMs must be 100..60000");
        if (memoryLimitMb < 16 || memoryLimitMb > 4096) throw new ArgumentException("MemoryLimitMB must be 16..4096");
    }
}
'@

Write-File "src/CodeJudge.Application/Validation/CreateSubmissionValidator.cs" @'
namespace CodeJudge.Application.Validation;

public static class CreateSubmissionValidator
{
    public static void Validate(string sourceCode)
    {
        if (string.IsNullOrWhiteSpace(sourceCode)) throw new ArgumentException("SourceCode required");
        if (sourceCode.Length > 200_000) throw new ArgumentException("SourceCode too large");
    }
}
'@

# Features placeholders (để đúng cấu trúc, build OK)
$featureStubs = @(
  "src/CodeJudge.Application/Features/Submissions/Commands/CreateSubmissionCommand.cs:CreateSubmissionCommand",
  "src/CodeJudge.Application/Features/Submissions/Commands/RejudgeSubmissionCommand.cs:RejudgeSubmissionCommand",
  "src/CodeJudge.Application/Features/Submissions/Commands/CancelSubmissionCommand.cs:CancelSubmissionCommand",
  "src/CodeJudge.Application/Features/Submissions/Queries/GetSubmissionByIdQuery.cs:GetSubmissionByIdQuery",
  "src/CodeJudge.Application/Features/Submissions/Queries/ListSubmissionsQuery.cs:ListSubmissionsQuery"
)

foreach ($s in $featureStubs) {
  $parts = $s.Split(":")
  $path = $parts[0]
  $cls = $parts[1]
  Write-File $path @"
namespace CodeJudge.Application.Features;

public sealed class $cls { }
"@
}

Write-File "src/CodeJudge.Application/Extensions/DependencyInjection.cs" @'
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CodeJudge.Application.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProblemService, ProblemService>();
        services.AddScoped<ITestCaseService, TestCaseService>();
        services.AddScoped<ILanguageService, LanguageService>();
        services.AddScoped<ISubmissionService, SubmissionService>();
        services.AddScoped<JudgeOrchestrator>();
        return services;
    }
}
'@

# ============================================
# INFRASTRUCTURE
# ============================================

Write-File "src/CodeJudge.Infrastructure/Persistence/SqlServer/JudgeDbContext.cs" @'
using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Persistence.SqlServer;

public sealed class JudgeDbContext : DbContext
{
    public JudgeDbContext(DbContextOptions<JudgeDbContext> options) : base(options) {}

    public DbSet<Problem> Problems => Set<Problem>();
    public DbSet<TestCase> TestCases => Set<TestCase>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<JudgeResult> SubmissionTestResults => Set<JudgeResult>();
    public DbSet<UserProblemStat> UserProblemStats => Set<UserProblemStat>();
    public DbSet<OutboxEvent> OutboxEvents => Set<OutboxEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JudgeDbContext).Assembly);
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Persistence/SqlServer/Configurations/ProblemConfiguration.cs" @'
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class ProblemConfiguration : IEntityTypeConfiguration<Problem>
{
    public void Configure(EntityTypeBuilder<Problem> b)
    {
        b.ToTable("Judge_Problems");
        b.HasKey(x => x.ProblemId);

        b.Property(x => x.ProblemId).HasColumnName("ProblemId");
        b.Property(x => x.Title).HasMaxLength(200).IsRequired();
        b.Property(x => x.Slug).HasMaxLength(200).IsRequired();
        b.HasIndex(x => x.Slug).IsUnique();

        b.Property(x => x.Difficulty).IsRequired();
        b.Property(x => x.TimeLimitMs).IsRequired();
        b.Property(x => x.MemoryLimitMB).IsRequired();
        b.Property(x => x.Statement).IsRequired();
        b.Property(x => x.CreatedByUserId).IsRequired();
        b.Property(x => x.IsPublic).HasDefaultValue(true);

        b.Property(x => x.Status).HasConversion<byte>().HasDefaultValue((byte)ProblemStatus.Active);

        b.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        b.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasMany(x => x.TestCases).WithOne(x => x.Problem!).HasForeignKey(x => x.ProblemId);
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Persistence/SqlServer/Configurations/TestCaseConfiguration.cs" @'
using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class TestCaseConfiguration : IEntityTypeConfiguration<TestCase>
{
    public void Configure(EntityTypeBuilder<TestCase> b)
    {
        b.ToTable("Judge_TestCases");
        b.HasKey(x => x.TestCaseId);

        b.Property(x => x.InputData).HasColumnType("varbinary(max)").IsRequired();
        b.Property(x => x.OutputData).HasColumnType("varbinary(max)").IsRequired();
        b.Property(x => x.IsSample).HasDefaultValue(false);
        b.Property(x => x.Score).HasDefaultValue(0);
        b.Property(x => x.OrderNo).IsRequired();

        b.HasIndex(x => new { x.ProblemId, x.OrderNo }).IsUnique();
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Persistence/SqlServer/Configurations/LanguageConfiguration.cs" @'
using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> b)
    {
        b.ToTable("Judge_Languages");
        b.HasKey(x => x.LanguageId);

        b.Property(x => x.Name).HasMaxLength(50).IsRequired();
        b.Property(x => x.Compiler).HasMaxLength(50).IsRequired();
        b.Property(x => x.Version).HasMaxLength(50);
        b.Property(x => x.IsEnabled).HasDefaultValue(true);

        b.HasIndex(x => x.Name).IsUnique();
        b.HasIndex(x => x.IsEnabled);
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Persistence/SqlServer/Configurations/SubmissionConfiguration.cs" @'
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> b)
    {
        b.ToTable("Judge_Submissions");
        b.HasKey(x => x.SubmissionId);

        b.Property(x => x.SourceCode).IsRequired();
        b.Property(x => x.CodeHash).HasColumnType("binary(32)").IsRequired();
        b.Property(x => x.SubmittedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.Property(x => x.Status).HasConversion<byte>().HasDefaultValue((byte)SubmissionStatus.Queued);

        b.Property(x => x.CompilerMessage).HasMaxLength(2000);

        b.HasIndex(x => new { x.UserId, x.SubmittedAt });
        b.HasIndex(x => new { x.ProblemId, x.SubmittedAt });
        b.HasIndex(x => new { x.Status, x.SubmittedAt });

        b.HasOne(x => x.Problem).WithMany().HasForeignKey(x => x.ProblemId);
        b.HasOne(x => x.Language).WithMany().HasForeignKey(x => x.LanguageId);

        b.HasMany(x => x.TestResults).WithOne(x => x.Submission!).HasForeignKey(x => x.SubmissionId);
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Persistence/SqlServer/Configurations/JudgeResultConfiguration.cs" @'
using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class JudgeResultConfiguration : IEntityTypeConfiguration<JudgeResult>
{
    public void Configure(EntityTypeBuilder<JudgeResult> b)
    {
        b.ToTable("Judge_SubmissionTestResults");
        b.HasKey(x => x.Id);

        b.Property(x => x.Status).IsRequired();
        b.Property(x => x.TimeMs).IsRequired();
        b.Property(x => x.MemoryKB).IsRequired();
        b.Property(x => x.ErrorMessage).HasMaxLength(1000);
        b.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasIndex(x => new { x.SubmissionId, x.TestCaseId }).IsUnique();
        b.HasIndex(x => x.SubmissionId);

        b.HasOne(x => x.TestCase).WithMany().HasForeignKey(x => x.TestCaseId);
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Persistence/SqlServer/Configurations/UserProblemStatConfiguration.cs" @'
using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class UserProblemStatConfiguration : IEntityTypeConfiguration<UserProblemStat>
{
    public void Configure(EntityTypeBuilder<UserProblemStat> b)
    {
        b.ToTable("Judge_UserProblemStats");
        b.HasKey(x => new { x.UserId, x.ProblemId });

        b.Property(x => x.Attempts).HasDefaultValue(0);
        b.Property(x => x.LastSubmittedAt).IsRequired();

        b.HasIndex(x => new { x.ProblemId, x.BestStatus, x.BestTimeMs });
        b.HasIndex(x => new { x.UserId, x.LastSubmittedAt });
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Persistence/SqlServer/Configurations/OutboxEventConfiguration.cs" @'
using CodeJudge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CodeJudge.Infrastructure.Persistence.SqlServer.Configurations;

public sealed class OutboxEventConfiguration : IEntityTypeConfiguration<OutboxEvent>
{
    public void Configure(EntityTypeBuilder<OutboxEvent> b)
    {
        b.ToTable("Judge_OutboxEvents");
        b.HasKey(x => x.EventId);

        b.Property(x => x.EventType).HasMaxLength(100).IsRequired();
        b.Property(x => x.PayloadJson).IsRequired();
        b.Property(x => x.OccurredAt).HasDefaultValueSql("SYSUTCDATETIME()");

        b.HasIndex(x => new { x.ProcessedAt, x.OccurredAt });
    }
}
'@

# Mongo (Execution Logs)
Write-File "src/CodeJudge.Infrastructure/Persistence/Mongo/MongoContext.cs" @'
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CodeJudge.Infrastructure.Persistence.Mongo;

public sealed class MongoOptions
{
    public string ConnectionString { get; set; } = default!;
    public string Database { get; set; } = default!;
}

public sealed class MongoContext
{
    public IMongoDatabase Db { get; }

    public MongoContext(IOptions<MongoOptions> opt)
    {
        var client = new MongoClient(opt.Value.ConnectionString);
        Db = client.GetDatabase(opt.Value.Database);
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Persistence/Mongo/Documents/ExecutionLogDocument.cs" @'
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CodeJudge.Infrastructure.Persistence.Mongo.Documents;

public sealed class ExecutionLogDocument
{
    [BsonId] public ObjectId Id { get; set; }
    public Guid SubmissionId { get; set; }
    public string Type { get; set; } = default!;
    public string Content { get; set; } = default!;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
'@

# Repositories SQL
Write-File "src/CodeJudge.Infrastructure/Repositories/SqlServer/UnitOfWork.cs" @'
using CodeJudge.Application.Interfaces;
using CodeJudge.Infrastructure.Persistence.SqlServer;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly JudgeDbContext _db;
    public UnitOfWork(JudgeDbContext db) => _db = db;
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
'@

Write-File "src/CodeJudge.Infrastructure/Repositories/SqlServer/ProblemRepository.cs" @'
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class ProblemRepository : IProblemRepository
{
    private readonly JudgeDbContext _db;
    public ProblemRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(Problem problem, CancellationToken ct = default) => _db.Problems.AddAsync(problem, ct).AsTask();

    public Task<Problem?> GetAsync(Guid problemId, CancellationToken ct = default)
        => _db.Problems.AsNoTracking().FirstOrDefaultAsync(x => x.ProblemId == problemId, ct);

    public Task<List<Problem>> ListAsync(CancellationToken ct = default)
        => _db.Problems.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync(ct);

    public void Update(Problem problem) => _db.Problems.Update(problem);
}
'@

Write-File "src/CodeJudge.Infrastructure/Repositories/SqlServer/TestCaseRepository.cs" @'
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class TestCaseRepository : ITestCaseRepository
{
    private readonly JudgeDbContext _db;
    public TestCaseRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(TestCase testCase, CancellationToken ct = default) => _db.TestCases.AddAsync(testCase, ct).AsTask();

    public Task<TestCase?> GetAsync(Guid testCaseId, CancellationToken ct = default)
        => _db.TestCases.FirstOrDefaultAsync(x => x.TestCaseId == testCaseId, ct);

    public Task<List<TestCase>> ListByProblemAsync(Guid problemId, CancellationToken ct = default)
        => _db.TestCases.AsNoTracking().Where(x => x.ProblemId == problemId).OrderBy(x => x.OrderNo).ToListAsync(ct);

    public void Remove(TestCase testCase) => _db.TestCases.Remove(testCase);
}
'@

Write-File "src/CodeJudge.Infrastructure/Repositories/SqlServer/LanguageRepository.cs" @'
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class LanguageRepository : ILanguageRepository
{
    private readonly JudgeDbContext _db;
    public LanguageRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(Language language, CancellationToken ct = default) => _db.Languages.AddAsync(language, ct).AsTask();

    public Task<Language?> GetAsync(int languageId, CancellationToken ct = default)
        => _db.Languages.AsNoTracking().FirstOrDefaultAsync(x => x.LanguageId == languageId, ct);

    public Task<Language?> GetByNameAsync(string name, CancellationToken ct = default)
        => _db.Languages.AsNoTracking().FirstOrDefaultAsync(x => x.Name == name, ct);

    public Task<List<Language>> ListAsync(CancellationToken ct = default)
        => _db.Languages.AsNoTracking().OrderBy(x => x.LanguageId).ToListAsync(ct);
}
'@

Write-File "src/CodeJudge.Infrastructure/Repositories/SqlServer/SubmissionRepository.cs" @'
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class SubmissionRepository : ISubmissionRepository
{
    private readonly JudgeDbContext _db;
    public SubmissionRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(Submission submission, CancellationToken ct = default) => _db.Submissions.AddAsync(submission, ct).AsTask();

    public Task<Submission?> GetAsync(Guid submissionId, CancellationToken ct = default)
        => _db.Submissions.AsNoTracking().FirstOrDefaultAsync(x => x.SubmissionId == submissionId, ct);

    public Task<Submission?> GetWithDetailsAsync(Guid submissionId, CancellationToken ct = default)
        => _db.Submissions.AsNoTracking()
            .Include(x => x.Language)
            .Include(x => x.TestResults).ThenInclude(r => r.TestCase)
            .FirstOrDefaultAsync(x => x.SubmissionId == submissionId, ct);

    public async Task UpdateStatusAsync(Guid submissionId, SubmissionStatus status, string? compilerMessage, int? totalTimeMs, int? totalMemoryKb, int? score, CancellationToken ct = default)
    {
        var sub = await _db.Submissions.FirstOrDefaultAsync(x => x.SubmissionId == submissionId, ct);
        if (sub is null) return;

        sub.Status = status;
        sub.CompilerMessage = compilerMessage;
        sub.TotalTimeMs = totalTimeMs;
        sub.TotalMemoryKB = totalMemoryKb;
        sub.Score = score;
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Repositories/SqlServer/JudgeResultRepository.cs" @'
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class JudgeResultRepository : IJudgeResultRepository
{
    private readonly JudgeDbContext _db;
    public JudgeResultRepository(JudgeDbContext db) => _db = db;

    public async Task DeleteBySubmissionAsync(Guid submissionId, CancellationToken ct = default)
    {
        var rows = await _db.SubmissionTestResults.Where(x => x.SubmissionId == submissionId).ToListAsync(ct);
        if (rows.Count > 0) _db.SubmissionTestResults.RemoveRange(rows);
    }

    public Task AddRangeAsync(IEnumerable<JudgeResult> results, CancellationToken ct = default)
        => _db.SubmissionTestResults.AddRangeAsync(results, ct);

    public Task<List<JudgeResult>> ListBySubmissionAsync(Guid submissionId, CancellationToken ct = default)
        => _db.SubmissionTestResults.AsNoTracking()
            .Include(x => x.TestCase)
            .Where(x => x.SubmissionId == submissionId)
            .ToListAsync(ct);
}
'@

Write-File "src/CodeJudge.Infrastructure/Repositories/SqlServer/UserProblemStatRepository.cs" @'
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;
using CodeJudge.Domain.Entities;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class UserProblemStatRepository : IUserProblemStatRepository
{
    private readonly JudgeDbContext _db;
    public UserProblemStatRepository(JudgeDbContext db) => _db = db;

    public async Task UpsertAsync(Guid userId, Guid problemId, byte submissionStatus, int? totalTimeMs, int? totalMemoryKb, int score, DateTime submittedAt, CancellationToken ct = default)
    {
        var stat = await _db.UserProblemStats.FirstOrDefaultAsync(x => x.UserId == userId && x.ProblemId == problemId, ct);

        if (stat is null)
        {
            stat = new UserProblemStat
            {
                UserId = userId,
                ProblemId = problemId,
                BestStatus = submissionStatus,
                BestTimeMs = totalTimeMs,
                BestMemoryKB = totalMemoryKb,
                Attempts = 1,
                LastSubmittedAt = submittedAt,
                FirstAcceptedAt = (submissionStatus == 3) ? submittedAt : null
            };
            _db.UserProblemStats.Add(stat);
            return;
        }

        stat.Attempts += 1;
        stat.LastSubmittedAt = submittedAt;

        // Update best:
        // If new is AC and old not AC -> replace
        // If both AC -> keep better time (smaller) then memory
        if (submissionStatus == 3)
        {
            if (stat.FirstAcceptedAt is null) stat.FirstAcceptedAt = submittedAt;

            if (stat.BestStatus != 3)
            {
                stat.BestStatus = 3;
                stat.BestTimeMs = totalTimeMs;
                stat.BestMemoryKB = totalMemoryKb;
            }
            else
            {
                if (totalTimeMs.HasValue && (!stat.BestTimeMs.HasValue || totalTimeMs.Value < stat.BestTimeMs.Value))
                {
                    stat.BestTimeMs = totalTimeMs;
                    stat.BestMemoryKB = totalMemoryKb;
                }
                else if (totalTimeMs == stat.BestTimeMs && totalMemoryKb.HasValue && (!stat.BestMemoryKB.HasValue || totalMemoryKb.Value < stat.BestMemoryKB.Value))
                {
                    stat.BestMemoryKB = totalMemoryKb;
                }
            }
        }
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/Repositories/SqlServer/OutboxRepository.cs" @'
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Infrastructure.Persistence.SqlServer;

namespace CodeJudge.Infrastructure.Repositories.SqlServer;

public sealed class OutboxRepository : IOutboxRepository
{
    private readonly JudgeDbContext _db;
    public OutboxRepository(JudgeDbContext db) => _db = db;

    public Task AddAsync(OutboxCreate req, CancellationToken ct = default)
    {
        _db.OutboxEvents.Add(new OutboxEvent
        {
            EventId = Guid.NewGuid(),
            AggregateId = req.AggregateId,
            EventType = req.EventType,
            PayloadJson = req.PayloadJson,
            OccurredAt = DateTime.UtcNow
        });
        return Task.CompletedTask;
    }
}
'@

# Mongo log repo
Write-File "src/CodeJudge.Infrastructure/Repositories/Mongo/ExecutionLogRepository.cs" @'
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Infrastructure.Persistence.Mongo;
using CodeJudge.Infrastructure.Persistence.Mongo.Documents;
using MongoDB.Driver;

namespace CodeJudge.Infrastructure.Repositories.Mongo;

public sealed class ExecutionLogRepository : IExecutionLogRepository
{
    private readonly IMongoCollection<ExecutionLogDocument> _col;

    public ExecutionLogRepository(MongoContext ctx)
    {
        _col = ctx.Db.GetCollection<ExecutionLogDocument>("execution_logs");
        _col.Indexes.CreateOne(new CreateIndexModel<ExecutionLogDocument>(
            Builders<ExecutionLogDocument>.IndexKeys.Ascending(x => x.SubmissionId)
        ));
    }

    public Task AppendAsync(Guid submissionId, string type, string content, CancellationToken ct = default)
        => _col.InsertOneAsync(new ExecutionLogDocument
        {
            SubmissionId = submissionId,
            Type = type,
            Content = content,
            CreatedAtUtc = DateTime.UtcNow
        }, cancellationToken: ct);
}
'@

# Runner models (kept for structure)
Write-File "src/CodeJudge.Infrastructure/Runners/Models/RunRequest.cs" @'
namespace CodeJudge.Infrastructure.Runners.Models;

public sealed record RunRequest(
    string LanguageName,
    string SourceCode,
    int TimeLimitMs,
    int MemoryLimitMb,
    IReadOnlyList<TestCaseRun> Tests
);

public sealed record TestCaseRun(int Index, string Input, string ExpectedOutput);
'@

Write-File "src/CodeJudge.Infrastructure/Runners/Models/RunResponse.cs" @'
namespace CodeJudge.Infrastructure.Runners.Models;

public sealed record RunResponse(
    string Verdict,
    string? CompileLog,
    int TotalTimeMs,
    int PeakMemoryKb,
    IReadOnlyList<TestRunResult> Tests
);

public sealed record TestRunResult(int Index, string Verdict, int TimeMs, int MemoryKb, string? Stdout, string? Stderr);
'@

Write-File "src/CodeJudge.Infrastructure/Runners/NodeRunnerClient.cs" @'
using System.Net.Http.Json;
using CodeJudge.Application.Interfaces;

namespace CodeJudge.Infrastructure.Runners;

public sealed class NodeRunnerClient : ICodeRunnerClient
{
    private readonly HttpClient _http;
    public NodeRunnerClient(HttpClient http) => _http = http;

    public async Task<RunnerRunResponse> RunAsync(RunnerRunRequest request, CancellationToken ct = default)
    {
        var resp = await _http.PostAsJsonAsync("/run", request, ct);
        resp.EnsureSuccessStatusCode();

        var data = await resp.Content.ReadFromJsonAsync<RunnerRunResponse>(cancellationToken: ct);
        return data ?? throw new InvalidOperationException("Runner returned empty response");
    }
}
'@

Write-File "src/CodeJudge.Infrastructure/DependencyInjection.cs" @'
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Infrastructure.Persistence.Mongo;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using CodeJudge.Infrastructure.Repositories.Mongo;
using CodeJudge.Infrastructure.Repositories.SqlServer;
using CodeJudge.Infrastructure.Runners;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CodeJudge.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // SQL
        services.AddDbContext<JudgeDbContext>(opt =>
            opt.UseSqlServer(config.GetConnectionString("SqlServer")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IProblemRepository, ProblemRepository>();
        services.AddScoped<ITestCaseRepository, TestCaseRepository>();
        services.AddScoped<ILanguageRepository, LanguageRepository>();
        services.AddScoped<ISubmissionRepository, SubmissionRepository>();
        services.AddScoped<IJudgeResultRepository, JudgeResultRepository>();
        services.AddScoped<IUserProblemStatRepository, UserProblemStatRepository>();
        services.AddScoped<IOutboxRepository, OutboxRepository>();

        // Mongo
        services.Configure<MongoOptions>(opt =>
        {
            opt.ConnectionString = config["Mongo:ConnectionString"] ?? "mongodb://localhost:27017";
            opt.Database = config["Mongo:Database"] ?? "JudgeLogs";
        });

        services.AddSingleton<MongoContext>();
        services.AddScoped<IExecutionLogRepository, ExecutionLogRepository>();

        // Runner
        var baseUrl = config["Runner:BaseUrl"] ?? "http://localhost:5001";
        services.AddHttpClient<ICodeRunnerClient, NodeRunnerClient>(http =>
        {
            http.BaseAddress = new Uri(baseUrl);
            http.Timeout = TimeSpan.FromSeconds(60);
        });

        return services;
    }
}
'@

# ============================================
# API
# ============================================

Write-File "src/CodeJudge.API/appsettings.json" @'
{
  "ConnectionStrings": {
    "SqlServer": "Server=localhost,1433;Database=JudgeDB;User Id=sa;Password=Your_password123;TrustServerCertificate=True;"
  },
  "Mongo": {
    "ConnectionString": "mongodb://localhost:27017",
    "Database": "JudgeLogs"
  },
  "Runner": {
    "BaseUrl": "http://localhost:5001"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
'@

Write-File "src/CodeJudge.API/Middlewares/CorrelationIdMiddleware.cs" @'
namespace CodeJudge.API.Middlewares;

public sealed class CorrelationIdMiddleware
{
    public const string HeaderName = "X-Correlation-Id";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx)
    {
        var cid = ctx.Request.Headers[HeaderName].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(cid)) cid = Guid.NewGuid().ToString("N");

        ctx.Items[HeaderName] = cid;
        ctx.Response.Headers[HeaderName] = cid;

        await _next(ctx);
    }
}
'@

Write-File "src/CodeJudge.API/Middlewares/ExceptionHandlingMiddleware.cs" @'
using System.Net;

namespace CodeJudge.API.Middlewares;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    public ExceptionHandlingMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsJsonAsync(new
            {
                error = ex.Message,
                trace = ex.GetType().Name
            });
        }
    }
}
'@

Write-File "src/CodeJudge.API/Extensions/SwaggerExtensions.cs" @'
namespace CodeJudge.API.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocs(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        return services;
    }

    public static IApplicationBuilder UseSwaggerDocs(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        return app;
    }
}
'@

Write-File "src/CodeJudge.API/Extensions/AuthExtensions.cs" @'
namespace CodeJudge.API.Extensions;

// bạn có thể tích hợp JWT sau; hiện để stub cho đúng cấu trúc
public static class AuthExtensions
{
    public static IServiceCollection AddAuth(this IServiceCollection services) => services;
    public static IApplicationBuilder UseAuth(this IApplicationBuilder app) => app;
}
'@

Write-File "src/CodeJudge.API/Extensions/DependencyInjection.cs" @'
using CodeJudge.Application.Extensions;
using CodeJudge.Infrastructure;

namespace CodeJudge.API.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddCodeJudge(this IServiceCollection services, IConfiguration config)
    {
        services.AddApplication();
        services.AddInfrastructure(config);
        return services;
    }
}
'@

# Queue + background service in API project
Write-File "src/CodeJudge.API/InMemoryJudgeQueue.cs" @'
using System.Threading.Channels;
using CodeJudge.Application.Interfaces;

namespace CodeJudge.API;

public sealed class InMemoryJudgeQueue : IJudgeQueue
{
    private readonly Channel<Guid> _ch = Channel.CreateUnbounded<Guid>();

    public ValueTask EnqueueAsync(Guid submissionId, CancellationToken ct = default)
        => _ch.Writer.WriteAsync(submissionId, ct);

    public async IAsyncEnumerable<Guid> DequeueAllAsync([System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
    {
        while (await _ch.Reader.WaitToReadAsync(ct))
        {
            while (_ch.Reader.TryRead(out var item))
                yield return item;
        }
    }
}
'@

Write-File "src/CodeJudge.API/JudgeBackgroundService.cs" @'
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Services;

namespace CodeJudge.API;

public sealed class JudgeBackgroundService : BackgroundService
{
    private readonly IJudgeQueue _queue;
    private readonly IServiceProvider _sp;

    public JudgeBackgroundService(IJudgeQueue queue, IServiceProvider sp)
    {
        _queue = queue;
        _sp = sp;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var submissionId in _queue.DequeueAllAsync(stoppingToken))
        {
            using var scope = _sp.CreateScope();
            var orchestrator = scope.ServiceProvider.GetRequiredService<JudgeOrchestrator>();
            await orchestrator.JudgeAsync(submissionId, stoppingToken);
        }
    }
}
'@

Write-File "src/CodeJudge.API/Controllers/ProblemsController.cs" @'
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Validation;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/problems")]
public sealed class ProblemsController : ControllerBase
{
    private readonly IProblemService _svc;
    public ProblemsController(IProblemService svc) => _svc = svc;

    [HttpGet]
    public Task<List<CodeJudge.Application.DTOs.ProblemDto>> List(CancellationToken ct) => _svc.ListAsync(ct);

    [HttpGet("{id:guid}")]
    public Task<CodeJudge.Application.DTOs.ProblemDto?> Get(Guid id, CancellationToken ct) => _svc.GetAsync(id, ct);

    public sealed record CreateReq(
        string Title,
        string Slug,
        byte Difficulty,
        int TimeLimitMs,
        int MemoryLimitMB,
        string Statement,
        Guid CreatedByUserId,
        bool IsPublic = true
    );

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReq req, CancellationToken ct)
    {
        CreateProblemValidator.Validate(req.Title, req.Slug, req.Difficulty, req.TimeLimitMs, req.MemoryLimitMB);

        var dto = await _svc.CreateAsync(new CreateProblemRequest(
            req.Title, req.Slug, req.Difficulty, req.TimeLimitMs, req.MemoryLimitMB, req.Statement, req.CreatedByUserId, req.IsPublic
        ), ct);

        return CreatedAtAction(nameof(Get), new { id = dto.ProblemId }, dto);
    }
}
'@

Write-File "src/CodeJudge.API/Controllers/TestCasesController.cs" @'
using CodeJudge.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/testcases")]
public sealed class TestCasesController : ControllerBase
{
    private readonly ITestCaseService _svc;
    public TestCasesController(ITestCaseService svc) => _svc = svc;

    [HttpGet("by-problem/{problemId:guid}")]
    public Task<List<CodeJudge.Application.DTOs.TestCaseDto>> ListByProblem(Guid problemId, CancellationToken ct)
        => _svc.ListByProblemAsync(problemId, ct);

    public sealed record CreateReq(Guid ProblemId, int OrderNo, bool IsSample, int Score, string InputText, string OutputText);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReq req, CancellationToken ct)
    {
        var dto = await _svc.CreateAsync(new CreateTestCaseRequest(req.ProblemId, req.OrderNo, req.IsSample, req.Score, req.InputText, req.OutputText), ct);
        return Ok(dto);
    }
}
'@

Write-File "src/CodeJudge.API/Controllers/LanguagesController.cs" @'
using CodeJudge.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/languages")]
public sealed class LanguagesController : ControllerBase
{
    private readonly ILanguageService _svc;
    public LanguagesController(ILanguageService svc) => _svc = svc;

    [HttpGet]
    public Task<List<CodeJudge.Application.DTOs.LanguageDto>> List(CancellationToken ct) => _svc.ListAsync(ct);
}
'@

Write-File "src/CodeJudge.API/Controllers/SubmissionsController.cs" @'
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Validation;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/submissions")]
public sealed class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _svc;
    public SubmissionsController(ISubmissionService svc) => _svc = svc;

    public sealed record CreateReq(Guid ProblemId, Guid UserId, int LanguageId, string SourceCode);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReq req, CancellationToken ct)
    {
        CreateSubmissionValidator.Validate(req.SourceCode);
        var dto = await _svc.CreateAsync(new CreateSubmissionRequest(req.ProblemId, req.UserId, req.LanguageId, req.SourceCode), ct);
        return Accepted(dto);
    }

    [HttpGet("{id:guid}")]
    public Task<CodeJudge.Application.DTOs.SubmissionDto?> Get(Guid id, CancellationToken ct) => _svc.GetAsync(id, ct);

    [HttpGet("{id:guid}/result")]
    public Task<CodeJudge.Application.DTOs.JudgeResultDto?> Result(Guid id, CancellationToken ct) => _svc.GetResultAsync(id, ct);
}
'@

Write-File "src/CodeJudge.API/Controllers/JudgeController.cs" @'
using CodeJudge.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/judge")]
public sealed class JudgeController : ControllerBase
{
    private readonly ISubmissionService _svc;
    public JudgeController(ISubmissionService svc) => _svc = svc;

    [HttpPost("{id:guid}/rejudge")]
    public async Task<IActionResult> Rejudge(Guid id, CancellationToken ct)
    {
        await _svc.RejudgeAsync(id, ct);
        return Accepted();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _svc.CancelAsync(id, ct);
        return Accepted();
    }
}
'@

Write-File "src/CodeJudge.API/Program.cs" @'
using CodeJudge.API;
using CodeJudge.API.Extensions;
using CodeJudge.API.Middlewares;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Infrastructure.Persistence.SqlServer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSwaggerDocs();
builder.Services.AddAuth();

builder.Services.AddCodeJudge(builder.Configuration);

// queue + background judge
builder.Services.AddSingleton<IJudgeQueue, InMemoryJudgeQueue>();
builder.Services.AddHostedService<JudgeBackgroundService>();

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSwaggerDocs();
app.UseAuth();

app.MapControllers();

// OPTIONAL: seed languages (nếu DB trống)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<JudgeDbContext>();
    // Nếu bạn đã chạy SQL script tạo sẵn bảng -> OK
    // Nếu chưa có bảng, EF sẽ fail -> hãy chạy SQL script trước.
    await db.Database.CanConnectAsync();

    var langSvc = scope.ServiceProvider.GetRequiredService<CodeJudge.Application.Interfaces.ILanguageService>();
    await langSvc.SeedDefaultAsync();
}

app.Run();
'@

# ============================================
# NODE RUNNER (JavaScript)
# ============================================

Write-File "src/CodeJudge.Runner.Node/package.json" @'
{
  "name": "codejudge-runner",
  "version": "1.0.0",
  "main": "src/server.js",
  "type": "commonjs",
  "scripts": { "start": "node src/server.js" },
  "dependencies": { "express": "^4.19.2" }
}
'@

Write-File "src/CodeJudge.Runner.Node/Dockerfile" @'
FROM mcr.microsoft.com/dotnet/sdk:8.0-jammy

RUN apt-get update && apt-get install -y curl python3 g++ && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i --omit=dev
COPY . .
EXPOSE 5001
CMD ["node","src/server.js"]
'@

Write-File "src/CodeJudge.Runner.Node/src/server.js" @'
const express = require("express");
const runRoutes = require("./routes/run.routes");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/", runRoutes);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Runner listening on ${port}`));
'@

Write-File "src/CodeJudge.Runner.Node/src/routes/run.routes.js" @'
const router = require("express").Router();
const { run } = require("../controllers/run.controller");

router.post("/run", run);

module.exports = router;
'@

Write-File "src/CodeJudge.Runner.Node/src/controllers/run.controller.js" @'
const { validateRunRequest } = require("../validators/runRequest.validator");
const { judgeAll } = require("../services/judge.service");

async function run(req, res) {
  const err = validateRunRequest(req.body);
  if (err) return res.status(400).json({ error: err });

  try {
    const result = await judgeAll(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({
      verdict: "RE",
      compileLog: String(e && e.stack ? e.stack : e),
      totalTimeMs: 0,
      peakMemoryKb: 0,
      tests: []
    });
  }
}

module.exports = { run };
'@

Write-File "src/CodeJudge.Runner.Node/src/validators/runRequest.validator.js" @'
function validateRunRequest(body) {
  if (!body) return "body required";
  const { languageName, sourceCode, timeLimitMs, memoryLimitMb, tests } = body;

  if (!languageName || typeof languageName !== "string") return "languageName required";
  if (!sourceCode || typeof sourceCode !== "string") return "sourceCode required";
  if (!Number.isInteger(timeLimitMs) || timeLimitMs <= 0) return "timeLimitMs invalid";
  if (!Number.isInteger(memoryLimitMb) || memoryLimitMb <= 0) return "memoryLimitMb invalid";
  if (!Array.isArray(tests) || tests.length === 0) return "tests required";

  for (const t of tests) {
    if (!Number.isInteger(t.index) || t.index <= 0) return "test.index invalid";
    if (typeof t.input !== "string") return "test.input invalid";
    if (typeof t.expectedOutput !== "string") return "test.expectedOutput invalid";
  }
  return null;
}

module.exports = { validateRunRequest };
'@

Write-File "src/CodeJudge.Runner.Node/src/services/judge.service.js" @'
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { runOne } = require("../runners/process.runner");
const { getLanguageSpec } = require("../languages");
const { normalize, equals } = require("../utils/output.util");

async function judgeAll(req) {
  const { languageName, sourceCode, timeLimitMs, tests } = req;
  const spec = getLanguageSpec(languageName);

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "judge-"));
  let compileLog = null;

  try {
    const srcPath = path.join(workDir, spec.sourceFile);
    await fs.writeFile(srcPath, sourceCode, "utf8");

    // compile if needed
    if (spec.compile) {
      const c = await runOne({ cwd: workDir, cmd: spec.compile.cmd, args: spec.compile.args, stdin: "", timeoutMs: Math.min(15000, timeLimitMs * 2) });
      compileLog = (c.stdout || "") + (c.stderr || "");
      if (c.exitCode !== 0) {
        return {
          verdict: "CE",
          compileLog,
          totalTimeMs: c.timeMs,
          peakMemoryKb: 0,
          tests: tests.map(t => ({ index: t.index, verdict: "CE", timeMs: 0, memoryKb: 0, stdout: null, stderr: null }))
        };
      }
    }

    const results = [];
    let totalTime = 0;
    let peakMem = 0;

    for (const t of tests) {
      const r = await runOne({ cwd: workDir, cmd: spec.run.cmd, args: spec.run.args, stdin: t.input, timeoutMs: timeLimitMs });
      totalTime += r.timeMs;
      peakMem = Math.max(peakMem, r.memoryKb || 0);

      if (r.timedOut) {
        results.push({ index: t.index, verdict: "TLE", timeMs: r.timeMs, memoryKb: 0, stdout: r.stdout, stderr: r.stderr });
        continue;
      }
      if (r.exitCode !== 0) {
        results.push({ index: t.index, verdict: "RE", timeMs: r.timeMs, memoryKb: 0, stdout: r.stdout, stderr: r.stderr });
        continue;
      }

      const ok = equals(normalize(r.stdout || ""), normalize(t.expectedOutput || ""));
      results.push({ index: t.index, verdict: ok ? "AC" : "WA", timeMs: r.timeMs, memoryKb: 0, stdout: r.stdout, stderr: r.stderr });
    }

    const finalVerdict = results.find(x => x.verdict !== "AC")?.verdict || "AC";

    return {
      verdict: finalVerdict,
      compileLog,
      totalTimeMs: totalTime,
      peakMemoryKb: peakMem,
      tests: results
    };
  } finally {
    try { await fs.rm(workDir, { recursive: true, force: true }); } catch {}
  }
}

module.exports = { judgeAll };
'@

Write-File "src/CodeJudge.Runner.Node/src/runners/process.runner.js" @'
const { spawn } = require("child_process");

function runOne({ cwd, cmd, args, stdin, timeoutMs }) {
  return new Promise((resolve) => {
    const start = Date.now();
    const p = spawn(cmd, args, { cwd });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try { p.kill("SIGKILL"); } catch {}
    }, timeoutMs);

    p.stdout.on("data", d => stdout += d.toString());
    p.stderr.on("data", d => stderr += d.toString());

    p.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        exitCode: code ?? -1,
        stdout,
        stderr,
        timedOut,
        timeMs: Date.now() - start,
        memoryKb: 0
      });
    });

    if (stdin && stdin.length > 0) p.stdin.write(stdin);
    p.stdin.end();
  });
}

module.exports = { runOne };
'@

Write-File "src/CodeJudge.Runner.Node/src/languages/index.js" @'
const path = require("path");

function getLanguageSpec(name) {
  const key = String(name || "").toLowerCase();

  if (key === "javascript") {
    return { sourceFile: "main.js", compile: null, run: { cmd: "node", args: ["main.js"] } };
  }
  if (key === "python") {
    return { sourceFile: "main.py", compile: null, run: { cmd: "python3", args: ["main.py"] } };
  }
  if (key === "cpp") {
    return {
      sourceFile: "main.cpp",
      compile: { cmd: "g++", args: ["-O2", "-std=c++17", "main.cpp", "-o", "main.out"] },
      run: { cmd: path.join(".", "main.out"), args: [] }
    };
  }

  // csharp: để "ăn ngay" bạn có thể tạm disable ở DB hoặc implement sau
  if (key === "csharp") {
    throw new Error("csharp runner not implemented in this minimal bootstrap");
  }

  throw new Error(`Unsupported language: ${name}`);
}

module.exports = { getLanguageSpec };
'@

Write-File "src/CodeJudge.Runner.Node/src/utils/output.util.js" @'
function normalize(s) {
  return String(s || "").replace(/\r\n/g, "\n").trimEnd();
}
function equals(a, b) {
  return normalize(a) === normalize(b);
}
module.exports = { normalize, equals };
'@

# other node files just for structure
Touch "src/CodeJudge.Runner.Node/src/services/compile.service.js"
Touch "src/CodeJudge.Runner.Node/src/runners/docker.runner.js"
Touch "src/CodeJudge.Runner.Node/src/runners/sandbox.policy.js"
Touch "src/CodeJudge.Runner.Node/src/languages/cpp.js"
Touch "src/CodeJudge.Runner.Node/src/languages/csharp.js"
Touch "src/CodeJudge.Runner.Node/src/languages/javascript.js"
Touch "src/CodeJudge.Runner.Node/src/languages/python.js"
Touch "src/CodeJudge.Runner.Node/src/contracts/runRequest.schema.json"
Touch "src/CodeJudge.Runner.Node/src/contracts/runResult.schema.json"
Touch "src/CodeJudge.Runner.Node/src/utils/fs.util.js"
Touch "src/CodeJudge.Runner.Node/src/utils/hash.util.js"
Touch "src/CodeJudge.Runner.Node/src/utils/time.util.js"
Touch "src/CodeJudge.Runner.Node/src/config/env.js"
Touch "src/CodeJudge.Runner.Node/src/config/constants.js"
Touch "src/CodeJudge.Runner.Node/test/run.e2e.test.js"
Touch "src/CodeJudge.Runner.Node/test/sandbox.policy.test.js"
Touch "src/CodeJudge.Runner.Node/README.md"
Touch "src/CodeJudge.Runner.Node/.env.example"
Touch "src/CodeJudge.Runner.Node/.eslintrc.json"

# ============================================
# Done
# ============================================

Write-Host ""
Write-Host "DONE. Code generated/overwritten under src/."
Write-Host "Next steps:"
Write-Host "1) Ensure JudgeDB tables exist (run your SQL script)."
Write-Host "2) Add NuGet packages if missing:"
Write-Host "   - CodeJudge.Infrastructure: Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.SqlServer, MongoDB.Driver"
Write-Host "3) Start runner:  cd src\CodeJudge.Runner.Node && npm i && npm start"
Write-Host "4) Start API:     dotnet run --project src\CodeJudge.API"
Write-Host ""
