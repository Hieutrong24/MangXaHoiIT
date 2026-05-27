using System.Text.Json;
using CodeJudge.Application.DTOs;
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
    public async Task<IActionResult> ListByProblem(Guid problemId, CancellationToken ct)
    {
        var list = await _svc.ListByProblemAsync(problemId, ct);
        return Ok(list.Select(NormalizeTestCase).ToList());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JsonElement body, CancellationToken ct)
    {
        var problemId = ReadGuid(body, "problemId", "ProblemId");
        if (!problemId.HasValue) return BadRequest(new { error = "ProblemId required" });

        var dto = await _svc.CreateAsync(
            new CreateTestCaseRequest(
                ProblemId: problemId.Value,
                OrderNo: ReadInt(body, 1, "orderNo", "OrderNo"),
                IsSample: ReadBool(body, false, "isSample", "IsSample"),
                Score: ReadDecimal(body, 0m, "score", "Score"),
                InputText: ReadString(body, "input", "inputText", "InputText") ?? string.Empty,
                OutputText: ReadString(body, "expectedOutput", "output", "outputText", "OutputText") ?? string.Empty),
            ct
        );
        return Ok(NormalizeTestCase(dto));
    }

    [HttpPut("{testCaseId:guid}")]
    public async Task<IActionResult> Update(Guid testCaseId, [FromBody] JsonElement body, CancellationToken ct)
    {
        var dto = await _svc.UpdateAsync(testCaseId, new UpdateTestCaseRequest(
            OrderNo: ReadIntNullable(body, "orderNo", "OrderNo"),
            IsSample: ReadBoolNullable(body, "isSample", "IsSample"),
            Score: ReadDecimalNullable(body, "score", "Score"),
            InputText: HasAny(body, "input", "inputText", "InputText") ? ReadString(body, "input", "inputText", "InputText") : null,
            OutputText: HasAny(body, "expectedOutput", "output", "outputText", "OutputText") ? ReadString(body, "expectedOutput", "output", "outputText", "OutputText") : null), ct);
        return dto is null ? NotFound() : Ok(NormalizeTestCase(dto));
    }

    [HttpDelete("{testCaseId:guid}")]
    public async Task<IActionResult> Delete(Guid testCaseId, CancellationToken ct)
    {
        var ok = await _svc.DeleteAsync(testCaseId, ct);
        return ok ? Ok(new { ok = true, testCaseId }) : NotFound();
    }

    private static object NormalizeTestCase(TestCaseDto dto) => new
    {
        id = dto.TestCaseId,
        testCaseId = dto.TestCaseId,
        problemId = dto.ProblemId,
        orderNo = dto.OrderNo,
        isSample = dto.IsSample,
        score = dto.Score,
        input = dto.InputText,
        inputText = dto.InputText,
        output = dto.OutputText,
        outputText = dto.OutputText,
        expectedOutput = dto.OutputText
    };

    private static bool HasAny(JsonElement body, params string[] names) => TryGetProperty(body, out _, names);

    private static string? ReadString(JsonElement body, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return null;
        if (prop.ValueKind == JsonValueKind.Null || prop.ValueKind == JsonValueKind.Undefined) return null;
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

    private static decimal ReadDecimal(JsonElement body, decimal fallback, params string[] names)
        => ReadDecimalNullable(body, names) ?? fallback;

    private static decimal? ReadDecimalNullable(JsonElement body, params string[] names)
    {
        if (!TryGetProperty(body, out var prop, names)) return null;
        if (prop.ValueKind == JsonValueKind.Number && prop.TryGetDecimal(out var numeric)) return numeric;
        if (prop.ValueKind == JsonValueKind.String && decimal.TryParse(prop.GetString(), out numeric)) return numeric;
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
