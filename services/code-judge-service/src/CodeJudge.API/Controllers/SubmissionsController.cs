using System.Text.Json;
using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Validation;
using CodeJudge.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/submissions")]
public sealed class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _svc;
    public SubmissionsController(ISubmissionService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body, CancellationToken ct)
    {
        var problemId = ReadGuid(body, "problemId", "ProblemId");
        var userId = ReadGuid(body, "userId", "UserId") ?? ReadGuidFromHeader();
        var languageId = ReadInt(body, 0, "languageId", "LanguageId");
        var sourceCode = ReadString(body, "sourceCode", "SourceCode") ?? string.Empty;

        if (!problemId.HasValue) return BadRequest(new { error = "ProblemId required" });
        if (!userId.HasValue) return BadRequest(new { error = "UserId required" });
        if (languageId <= 0) return BadRequest(new { error = "LanguageId invalid" });

        CreateSubmissionValidator.Validate(sourceCode);
        var dto = await _svc.CreateAsync(new CreateSubmissionRequest(problemId.Value, userId.Value, languageId, sourceCode), ct);
        return Accepted(NormalizeSubmission(dto));
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] Guid? problemId,
        [FromQuery] Guid? userId,
        [FromQuery] string? status,
        [FromQuery] string? language,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        [FromQuery] int limit = 100,
        CancellationToken ct = default)
    {
        var parsedStatus = ParseStatus(status);
        var requestedLimit = Math.Max(limit, Math.Max(1, page) * Math.Max(1, pageSize));
        var items = await _svc.ListAsync(problemId, userId, parsedStatus, requestedLimit, ct);

        IEnumerable<SubmissionDto> query = items;

        if (!string.IsNullOrWhiteSpace(language))
        {
            var normalizedLanguage = language.Trim();
            query = query.Where(x =>
                string.Equals(x.LanguageName, normalizedLanguage, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(x.LanguageId.ToString(), normalizedLanguage, StringComparison.OrdinalIgnoreCase));
        }

        var filtered = query.OrderByDescending(x => x.SubmittedAt).ToList();

        if (Request.Query.ContainsKey("page") || Request.Query.ContainsKey("pageSize") || Request.Query.ContainsKey("language") || Request.Query.ContainsKey("status"))
        {
            var normalizedPage = page <= 0 ? 1 : page;
            var normalizedPageSize = pageSize <= 0 ? 30 : Math.Min(pageSize, 100);
            var total = filtered.Count;
            var pagedItems = filtered
                .Skip((normalizedPage - 1) * normalizedPageSize)
                .Take(normalizedPageSize)
                .Select(NormalizeSubmission)
                .ToList();

            return Ok(new
            {
                items = pagedItems,
                total,
                page = normalizedPage,
                pageSize = normalizedPageSize
            });
        }

        return Ok(filtered.Select(NormalizeSubmission).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var dto = await _svc.GetAsync(id, ct);
        return dto is null ? NotFound() : Ok(NormalizeSubmission(dto));
    }

    [HttpGet("{id:guid}/result")]
    public Task<JudgeResultDto?> Result(Guid id, CancellationToken ct) => _svc.GetResultAsync(id, ct);

    [HttpPost("{id:guid}/rejudge")]
    public async Task<IActionResult> Rejudge(Guid id, CancellationToken ct)
    {
        await _svc.RejudgeAsync(id, ct);
        return Ok(new { ok = true, submissionId = id, action = "rejudge" });
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _svc.CancelAsync(id, ct);
        return Ok(new { ok = true, submissionId = id, action = "cancel" });
    }

    private Guid? ReadGuidFromHeader()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var values) && Guid.TryParse(values.FirstOrDefault(), out var parsed)) return parsed;
        if (Request.Headers.TryGetValue("x-user-id", out values) && Guid.TryParse(values.FirstOrDefault(), out parsed)) return parsed;
        return null;
    }

    private static object NormalizeSubmission(SubmissionDto dto) => new
    {
        id = dto.SubmissionId,
        submissionId = dto.SubmissionId,
        problemId = dto.ProblemId,
        userId = dto.UserId,
        languageId = dto.LanguageId,
        language = dto.LanguageName,
        languageName = dto.LanguageName,
        status = ToStatusText(dto.Status),
        statusValue = dto.Status,
        submittedAt = dto.SubmittedAt,
        createdAt = dto.SubmittedAt,
        totalTimeMs = dto.TotalTimeMs,
        totalMemoryKB = dto.TotalMemoryKB,
        score = dto.Score,
        compilerMessage = dto.CompilerMessage
    };

    private static byte? ParseStatus(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var normalized = value.Trim().ToLowerInvariant();
        return normalized switch
        {
            "queued" => (byte)SubmissionStatus.Queued,
            "running" => (byte)SubmissionStatus.Running,
            "ac" => (byte)SubmissionStatus.AC,
            "wa" => (byte)SubmissionStatus.WA,
            "tle" => (byte)SubmissionStatus.TLE,
            "mle" => (byte)SubmissionStatus.MLE,
            "re" => (byte)SubmissionStatus.RE,
            "ce" => (byte)SubmissionStatus.CE,
            _ => byte.TryParse(normalized, out var parsed) ? parsed : null
        };
    }

    private static string ToStatusText(byte status)
        => status switch
        {
            (byte)SubmissionStatus.Queued => "queued",
            (byte)SubmissionStatus.Running => "running",
            (byte)SubmissionStatus.AC => "ac",
            (byte)SubmissionStatus.WA => "wa",
            (byte)SubmissionStatus.TLE => "tle",
            (byte)SubmissionStatus.MLE => "mle",
            (byte)SubmissionStatus.RE => "re",
            (byte)SubmissionStatus.CE => "ce",
            _ => status.ToString()
        };

    private static string? ReadString(JsonElement body, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return null;
        if (prop.ValueKind == JsonValueKind.Null || prop.ValueKind == JsonValueKind.Undefined) return null;
        return prop.ValueKind == JsonValueKind.String ? prop.GetString() : prop.ToString();
    }

    private static int ReadInt(JsonElement body, int fallback, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return fallback;
        if (prop.ValueKind == JsonValueKind.Number && prop.TryGetInt32(out var numeric)) return numeric;
        if (prop.ValueKind == JsonValueKind.String && int.TryParse(prop.GetString(), out numeric)) return numeric;
        return fallback;
    }

    private static Guid? ReadGuid(JsonElement body, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return null;
        if (prop.ValueKind == JsonValueKind.String && Guid.TryParse(prop.GetString(), out var parsed)) return parsed;
        return null;
    }

    private static bool TryGetProperty(JsonElement body, out JsonElement value, params string[] names)
    {
        if (body.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in body.EnumerateObject())
            {
                foreach (var name in names)
                {
                    if (string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase))
                    {
                        value = property.Value;
                        return true;
                    }
                }
            }
        }

        value = default;
        return false;
    }
}
