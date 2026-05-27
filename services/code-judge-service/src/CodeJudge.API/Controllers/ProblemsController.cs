using System.Text.Json;
using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using CodeJudge.Application.Validation;
using CodeJudge.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace CodeJudge.API.Controllers;

[ApiController]
[Route("api/problems")]
public sealed class ProblemsController : ControllerBase
{
    private readonly IProblemService _svc;
    public ProblemsController(IProblemService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? keyword,
        [FromQuery] string? difficulty,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var items = await _svc.ListAsync(ct);

        IEnumerable<ProblemDto> query = items;

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = keyword.Trim();
            query = query.Where(x =>
                x.Title.Contains(normalizedKeyword, StringComparison.OrdinalIgnoreCase) ||
                x.Slug.Contains(normalizedKeyword, StringComparison.OrdinalIgnoreCase) ||
                x.Statement.Contains(normalizedKeyword, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrWhiteSpace(x.SkillTag) && x.SkillTag.Contains(normalizedKeyword, StringComparison.OrdinalIgnoreCase)));
        }

        var parsedDifficulty = ParseDifficulty(difficulty);
        if (parsedDifficulty.HasValue)
            query = query.Where(x => x.Difficulty == parsedDifficulty.Value);

        var normalizedPage = page <= 0 ? 1 : page;
        var normalizedPageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 100);
        var filtered = query.OrderByDescending(x => x.UpdatedAt).ThenByDescending(x => x.CreatedAt).ToList();

        if (Request.Query.ContainsKey("page") || Request.Query.ContainsKey("pageSize") || Request.Query.ContainsKey("keyword") || Request.Query.ContainsKey("difficulty"))
        {
            var total = filtered.Count;
            var pagedItems = filtered
                .Skip((normalizedPage - 1) * normalizedPageSize)
                .Take(normalizedPageSize)
                .Select(NormalizeProblem)
                .ToList();

            return Ok(new
            {
                items = pagedItems,
                total,
                page = normalizedPage,
                pageSize = normalizedPageSize
            });
        }

        return Ok(filtered.Select(NormalizeProblem).ToList());
    }

    [HttpGet("oj")]
    public Task<OJProblemListResponseDto> ListOj(
        [FromQuery] string? keyword,
        [FromQuery] byte? difficulty,
        [FromQuery(Name = "group")] string? groupName,
        [FromQuery(Name = "type")] string? typeName,
        [FromQuery] int? minScore,
        [FromQuery] int? maxScore,
        [FromQuery] string? userStatus,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDir = null,
        [FromQuery] string? topic = null,
        [FromQuery] string? skillTag = null,
        [FromQuery] string? userId = null,
        CancellationToken ct = default)
    {
        Guid? currentUserId = Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
        var request = new ProblemSearchRequest(keyword, difficulty, groupName, typeName, minScore, maxScore, userStatus, page, pageSize, sortBy, sortDir, false, topic, skillTag);
        return _svc.ListOjAsync(request, currentUserId, ct);
    }

    [HttpGet("featured")]
    public Task<List<FeaturedProblemDto>> Featured([FromQuery] int limit = 8, [FromQuery] string? userId = null, CancellationToken ct = default)
    {
        Guid? currentUserId = Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
        return _svc.ListFeaturedAsync(limit, currentUserId, ct);
    }

    [HttpGet("{id:guid}/overview")]
    public Task<ProblemOverviewDto?> Overview(Guid id, [FromQuery] string? userId = null, CancellationToken ct = default)
    {
        Guid? currentUserId = Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
        return _svc.GetOverviewAsync(id, currentUserId, ct);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var dto = await _svc.GetAsync(id, ct);
        return dto is null ? NotFound() : Ok(NormalizeProblem(dto));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body, CancellationToken ct)
    {
        var title = ReadString(body, "title", "Title");
        var statement = ReadString(body, "statement", "Statement") ?? string.Empty;
        var slug = ReadString(body, "slug", "Slug") ?? string.Empty;
        var difficulty = ParseDifficulty(body);
        var timeLimitMs = ReadInt(body, 1000, "timeLimitMs", "TimeLimitMs");
        var memoryLimitMb = ReadInt(body, 256, "memoryLimitMb", "memoryLimitMB", "MemoryLimitMb", "MemoryLimitMB");
        var isPublished = ReadBool(body, true, "isPublished", "isPublic", "IsPublished", "IsPublic");
        var createdByUserId = ReadGuid(body, "createdByUserId", "CreatedByUserId") ?? ReadGuidFromHeader();

        if (string.IsNullOrWhiteSpace(title))
            return BadRequest(new { error = "Title required" });
        if (!difficulty.HasValue)
            return BadRequest(new { error = "Difficulty invalid" });
        if (!createdByUserId.HasValue)
            return BadRequest(new { error = "CreatedByUserId required" });

        CreateProblemValidator.Validate(title, slug, difficulty.Value, timeLimitMs, memoryLimitMb);

        var status = ReadStatus(body, isPublished);
        var skillTag = ReadTags(body);
        var explanation = ReadString(body, "explanation", "editorialText", "hintText", "Explanation", "EditorialText", "HintText");

        var dto = await _svc.CreateAsync(new CreateProblemRequest(
            Title: title,
            Slug: slug,
            Difficulty: difficulty.Value,
            TimeLimitMs: timeLimitMs,
            MemoryLimitMB: memoryLimitMb,
            Statement: statement,
            CreatedByUserId: createdByUserId.Value,
            IsPublic: isPublished,
            Status: status,
            ProblemType: ReadString(body, "problemType", "ProblemType"),
            Topic: ReadString(body, "topic", "Topic"),
            SkillTag: skillTag,
            InputFormat: ReadString(body, "inputFormat", "InputFormat"),
            OutputFormat: ReadString(body, "outputFormat", "OutputFormat"),
            ConstraintsText: ReadString(body, "constraints", "constraintsText", "ConstraintsText"),
            HintText: explanation,
            EditorialText: explanation,
            IsFeatured: ReadBoolNullable(body, "isFeatured", "IsFeatured")
        ), ct);

        return CreatedAtAction(nameof(Get), new { id = dto.ProblemId }, NormalizeProblem(dto));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] JsonElement body, CancellationToken ct)
    {
        byte? difficulty = HasAny(body, "difficulty", "Difficulty") ? ParseDifficulty(body) : null;
        if (HasAny(body, "difficulty", "Difficulty") && !difficulty.HasValue)
            return BadRequest(new { error = "Difficulty invalid" });
        int? timeLimitMs = ReadIntNullable(body, "timeLimitMs", "TimeLimitMs");
        int? memoryLimitMb = ReadIntNullable(body, "memoryLimitMb", "memoryLimitMB", "MemoryLimitMb", "MemoryLimitMB");
        bool? isPublished = ReadBoolNullable(body, "isPublished", "isPublic", "IsPublished", "IsPublic");
        byte? status = ReadStatusNullable(body, isPublished);
        var explanation = HasAny(body, "explanation", "editorialText", "hintText", "Explanation", "EditorialText", "HintText")
            ? ReadString(body, "explanation", "editorialText", "hintText", "Explanation", "EditorialText", "HintText")
            : null;

        if (difficulty.HasValue || timeLimitMs.HasValue || memoryLimitMb.HasValue)
        {
            var existing = await _svc.GetAsync(id, ct);
            if (existing is null) return NotFound();
            CreateProblemValidator.Validate(
                ReadString(body, "title", "Title") ?? existing.Title,
                ReadString(body, "slug", "Slug") ?? existing.Slug,
                difficulty ?? existing.Difficulty,
                timeLimitMs ?? existing.TimeLimitMs,
                memoryLimitMb ?? existing.MemoryLimitMB);
        }

        var dto = await _svc.UpdateAsync(id, new UpdateProblemRequest(
            Title: ReadString(body, "title", "Title"),
            Slug: ReadString(body, "slug", "Slug"),
            Difficulty: difficulty,
            TimeLimitMs: timeLimitMs,
            MemoryLimitMB: memoryLimitMb,
            Statement: ReadNullableString(body, "statement", "Statement"),
            IsPublic: isPublished,
            Status: status,
            ProblemType: HasAny(body, "problemType", "ProblemType") ? ReadString(body, "problemType", "ProblemType") : null,
            Topic: HasAny(body, "topic", "Topic") ? ReadString(body, "topic", "Topic") : null,
            SkillTag: HasAny(body, "tags", "skillTag", "SkillTag") ? ReadTags(body) : null,
            InputFormat: HasAny(body, "inputFormat", "InputFormat") ? ReadString(body, "inputFormat", "InputFormat") : null,
            OutputFormat: HasAny(body, "outputFormat", "OutputFormat") ? ReadString(body, "outputFormat", "OutputFormat") : null,
            ConstraintsText: HasAny(body, "constraints", "constraintsText", "ConstraintsText") ? ReadString(body, "constraints", "constraintsText", "ConstraintsText") : null,
            HintText: explanation,
            EditorialText: explanation,
            IsFeatured: ReadBoolNullable(body, "isFeatured", "IsFeatured")
        ), ct);

        return dto is null ? NotFound() : Ok(NormalizeProblem(dto));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var dto = await _svc.DeleteAsync(id, ct);
        return dto is null ? NotFound() : Ok(new { success = true, data = NormalizeProblem(dto) });
    }

    private Guid? ReadGuidFromHeader()
    {
        if (Request.Headers.TryGetValue("X-User-Id", out var values) && Guid.TryParse(values.FirstOrDefault(), out var parsed)) return parsed;
        if (Request.Headers.TryGetValue("x-user-id", out values) && Guid.TryParse(values.FirstOrDefault(), out parsed)) return parsed;
        return null;
    }

    private static object NormalizeProblem(ProblemDto dto)
    {
        var difficultyLabel = ToDifficultyLabel(dto.Difficulty);
        var tags = SplitTags(dto.SkillTag);
        var statusText = ToStatusText(dto.Status, dto.IsPublic);
        var explanation = string.IsNullOrWhiteSpace(dto.EditorialText) ? dto.HintText : dto.EditorialText;

        return new
        {
            id = dto.ProblemId,
            problemId = dto.ProblemId,
            title = dto.Title,
            slug = dto.Slug,
            statement = dto.Statement,
            difficulty = difficultyLabel,
            difficultyValue = dto.Difficulty,
            timeLimitMs = dto.TimeLimitMs,
            memoryLimitMb = dto.MemoryLimitMB,
            isPublished = dto.IsPublic,
            isPublic = dto.IsPublic,
            status = statusText,
            statusValue = dto.Status,
            tags,
            skillTag = dto.SkillTag,
            topic = dto.Topic,
            problemType = dto.ProblemType,
            inputFormat = dto.InputFormat,
            outputFormat = dto.OutputFormat,
            constraints = dto.ConstraintsText,
            constraintsText = dto.ConstraintsText,
            hintText = dto.HintText,
            editorialText = dto.EditorialText,
            explanation,
            createdAt = dto.CreatedAt,
            updatedAt = dto.UpdatedAt,
            isFeatured = dto.IsFeatured ?? false,
            allowCustomInput = dto.AllowCustomInput ?? true,
            allowPartialScoring = dto.AllowPartialScoring ?? false
        };
    }

    private static byte? ParseDifficulty(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var normalized = value.Trim().ToLowerInvariant();
        return normalized switch
        {
            "easy" or "dễ" => 1,
            "medium" or "trungbinh" or "trung-binh" or "trung bình" => 2,
            "hard" or "khó" or "kho" => 3,
            _ => byte.TryParse(normalized, out var parsed) ? parsed : null
        };
    }

    private static byte? ParseDifficulty(JsonElement body)
    {
        if (!TryGetProperty(body, out var prop, "difficulty", "Difficulty")) return null;
        return prop.ValueKind switch
        {
            JsonValueKind.Number when prop.TryGetByte(out var numeric) => numeric,
            JsonValueKind.String => ParseDifficulty(prop.GetString()),
            _ => null
        };
    }

    private static string ToDifficultyLabel(byte difficulty)
        => difficulty switch
        {
            <= 1 => "easy",
            2 => "medium",
            _ => "hard"
        };

    private static string ToStatusText(byte status, bool isPublic)
    {
        if (status == (byte)ProblemStatus.Deleted) return "deleted";
        if (status == (byte)ProblemStatus.Hidden || !isPublic) return "draft";
        return "published";
    }

    private static byte ReadStatus(JsonElement body, bool isPublished)
    {
        var explicitStatus = ReadStatusNullable(body, isPublished);
        return explicitStatus ?? (isPublished ? (byte)ProblemStatus.Active : (byte)ProblemStatus.Hidden);
    }

    private static byte? ReadStatusNullable(JsonElement body, bool? isPublished)
    {
        if (TryGetProperty(body, out var prop, "status", "Status"))
        {
            if (prop.ValueKind == JsonValueKind.Number && prop.TryGetByte(out var numeric)) return numeric;
            if (prop.ValueKind == JsonValueKind.String)
            {
                var text = prop.GetString()?.Trim().ToLowerInvariant();
                return text switch
                {
                    "published" or "active" => (byte)ProblemStatus.Active,
                    "draft" or "hidden" => (byte)ProblemStatus.Hidden,
                    "deleted" => (byte)ProblemStatus.Deleted,
                    _ => byte.TryParse(text, out var parsed) ? parsed : null
                };
            }
        }

        if (isPublished.HasValue) return isPublished.Value ? (byte)ProblemStatus.Active : (byte)ProblemStatus.Hidden;
        return null;
    }

    private static string? ReadTags(JsonElement body)
    {
        if (!TryGetProperty(body, out var prop, "tags", "skillTag", "SkillTag", "Tags")) return null;
        if (prop.ValueKind == JsonValueKind.Array)
        {
            var values = prop.EnumerateArray()
                .Where(x => x.ValueKind == JsonValueKind.String)
                .Select(x => x.GetString()?.Trim())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Cast<string>()
                .ToArray();
            return values.Length == 0 ? null : string.Join(", ", values);
        }
        if (prop.ValueKind == JsonValueKind.String)
        {
            var value = prop.GetString()?.Trim();
            return string.IsNullOrWhiteSpace(value) ? null : value;
        }
        return null;
    }

    private static string[] SplitTags(string? raw)
        => string.IsNullOrWhiteSpace(raw)
            ? Array.Empty<string>()
            : raw.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static bool HasAny(JsonElement body, params string[] names) => TryGetProperty(body, out _, names);

    private static string? ReadString(JsonElement body, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return null;
        return prop.ValueKind == JsonValueKind.String ? prop.GetString() : prop.ToString();
    }

    private static string? ReadNullableString(JsonElement body, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return null;
        if (prop.ValueKind == JsonValueKind.Null || prop.ValueKind == JsonValueKind.Undefined) return string.Empty;
        return prop.ValueKind == JsonValueKind.String ? prop.GetString() : prop.ToString();
    }

    private static int ReadInt(JsonElement body, int fallback, params string[] names)
        => ReadIntNullable(body, names) ?? fallback;

    private static int? ReadIntNullable(JsonElement body, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return null;
        if (prop.ValueKind == JsonValueKind.Number && prop.TryGetInt32(out var numeric)) return numeric;
        if (prop.ValueKind == JsonValueKind.String && int.TryParse(prop.GetString(), out numeric)) return numeric;
        return null;
    }

    private static bool ReadBool(JsonElement body, bool fallback, params string[] names)
        => ReadBoolNullable(body, names) ?? fallback;

    private static bool? ReadBoolNullable(JsonElement body, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return null;
        if (prop.ValueKind is JsonValueKind.True or JsonValueKind.False) return prop.GetBoolean();
        if (prop.ValueKind == JsonValueKind.String && bool.TryParse(prop.GetString(), out var parsed)) return parsed;
        return null;
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
