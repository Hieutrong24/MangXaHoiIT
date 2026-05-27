using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CodeJudge.Infrastructure.Runners;

public class Judge0Service : IJudge0Service
{
    private readonly HttpClient _http;
    private readonly Judge0Options _opt;
    private readonly ILogger<Judge0Service> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public Judge0Service(
        HttpClient http,
        IOptions<Judge0Options> options,
        ILogger<Judge0Service> logger)
    {
        _http = http;
        _opt = options.Value;
        _logger = logger;

        _http.BaseAddress ??= new Uri((_opt.BaseUrl ?? "https://ce.judge0.com").TrimEnd('/') + "/");

        if (!_http.DefaultRequestHeaders.Accept.Any(h => h.MediaType == "application/json"))
            _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        _logger.LogInformation("[Judge0] BaseUrl={BaseUrl}, ApiKeyEmpty={ApiKeyEmpty}",
            _http.BaseAddress, string.IsNullOrWhiteSpace(_opt.ApiKey));

        var host = _http.BaseAddress.Host ?? "";
        var isCEPublic = host.Contains("ce.judge0.com", StringComparison.OrdinalIgnoreCase);

        if (!isCEPublic && !string.IsNullOrWhiteSpace(_opt.ApiKey))
        {
            if (!_http.DefaultRequestHeaders.Contains("X-Auth-Token"))
                _http.DefaultRequestHeaders.TryAddWithoutValidation("X-Auth-Token", _opt.ApiKey);
        }
        else
        {
            if (_http.DefaultRequestHeaders.Contains("X-Auth-Token"))
                _http.DefaultRequestHeaders.Remove("X-Auth-Token");
        }

        RemoveIfExists("X-RapidAPI-Key");
        RemoveIfExists("X-RapidAPI-Host");
        RemoveIfExists("X-RapidAPI-Proxy-Secret");
    }

    public Task<Judge0SubmissionResponseDto> RunAsync(Judge0RequestDto request, CancellationToken ct = default)
        => PostSubmissionAsync("submissions?base64_encoded=false&wait=true", request, ct);

    public Task<Judge0SubmissionResponseDto> SubmitAsync(Judge0RequestDto request, CancellationToken ct = default)
        => PostSubmissionAsync("submissions?base64_encoded=false&wait=false", request, ct);

    public async Task<Judge0SubmissionResponseDto> GetResultAsync(string token, CancellationToken ct = default)
    {
        var url = $"submissions/{token}?base64_encoded=false";
        using var res = await _http.GetAsync(url, ct);

        var body = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
        {
            _logger.LogWarning("[Judge0] GET failed {StatusCode}. Body={Body}", (int)res.StatusCode, Trim(body, 500));
            throw new HttpRequestException($"Judge0 GET failed: {(int)res.StatusCode} - {body}");
        }

        var dto = JsonSerializer.Deserialize<Judge0SubmissionResponseDto>(body, JsonOpts);
        return dto ?? new Judge0SubmissionResponseDto { Message = "Judge0 returned empty response" };
    }

    private async Task<Judge0SubmissionResponseDto> PostSubmissionAsync(string relativeUrl, Judge0RequestDto request, CancellationToken ct)
    {
        if (request.LanguageId <= 0 && string.IsNullOrWhiteSpace(request.LanguageName))
            throw new ArgumentException("languageId or languageName must be provided");

        if (string.IsNullOrWhiteSpace(request.SourceCode))
            throw new ArgumentException("sourceCode must not be empty");

        var resolvedLanguageId = ResolveJudge0LanguageId(request);

        var payload = new Dictionary<string, object?>
        {
            ["language_id"] = resolvedLanguageId,
            ["source_code"] = request.SourceCode,
            ["stdin"] = request.Stdin ?? "",
        };

        if (!string.IsNullOrWhiteSpace(request.ExpectedOutput))
            payload["expected_output"] = request.ExpectedOutput;

        if (request.CpuTimeLimit.HasValue && request.CpuTimeLimit.Value > 0)
            payload["cpu_time_limit"] = request.CpuTimeLimit.Value;

        if (request.MemoryLimit.HasValue && request.MemoryLimit.Value > 0)
            payload["memory_limit"] = request.MemoryLimit.Value;

        var json = JsonSerializer.Serialize(payload, JsonOpts);

        _logger.LogInformation("[Judge0] POST {Url} language_id={Lang} sourceLanguage={SourceLang} stdinLen={StdinLen} codeLen={CodeLen}",
            relativeUrl, resolvedLanguageId, request.LanguageName ?? request.LanguageId.ToString(), (request.Stdin ?? "").Length, request.SourceCode.Length);

        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        using var res = await _http.PostAsync(relativeUrl, content, ct);

        var body = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
        {
            _logger.LogWarning("[Judge0] POST failed {StatusCode}. Body={Body}", (int)res.StatusCode, Trim(body, 800));
            throw new HttpRequestException($"Judge0 POST failed: {(int)res.StatusCode} - {body}");
        }

        var dto = JsonSerializer.Deserialize<Judge0SubmissionResponseDto>(body, JsonOpts);
        return dto ?? new Judge0SubmissionResponseDto { Message = "Judge0 returned empty response" };
    }

    private static int ResolveJudge0LanguageId(Judge0RequestDto request)
    {
        if (IsKnownJudge0LanguageId(request.LanguageId))
            return request.LanguageId;

        var normalizedName = NormalizeLanguageName(request.LanguageName);
        if (!string.IsNullOrWhiteSpace(normalizedName))
            return normalizedName switch
            {
                "c" => 50,
                "go" => 60,
                "java" => 62,
                "javascript" => 63,
                "python" => 71,
                "cpp" => 54,
                "csharp" => 51,
                _ => throw new ArgumentException($"Unsupported Judge0 language: {request.LanguageName}")
            };

        return request.LanguageId switch
        {
            1 => 63,
            2 => 71,
            3 => 54,
            4 => 51,
            _ => request.LanguageId
        };
    }

    private static bool IsKnownJudge0LanguageId(int languageId)
        => languageId is 50 or 51 or 54 or 60 or 62 or 63 or 71;

    private static string? NormalizeLanguageName(string? languageName)
    {
        if (string.IsNullOrWhiteSpace(languageName)) return null;

        var key = languageName.Trim().ToLowerInvariant();
        if (key.Contains("python")) return "python";
        if (key == "c" || key.Contains("gnu c") || key.Contains("gcc")) return "c";
        if (key.Contains("c++") || key.Contains("cpp") || key.Contains("g++")) return "cpp";
        if (key.Contains("java") && !key.Contains("javascript")) return "java";
        if (key == "go" || key.Contains("golang")) return "go";
        if (key.Contains("c#") || key.Contains("csharp") || key.Contains("dotnet")) return "csharp";
        if (key.Contains("javascript") || key.Contains("node")) return "javascript";
        return key;
    }

    private void RemoveIfExists(string headerName)
    {
        if (_http.DefaultRequestHeaders.Contains(headerName))
            _http.DefaultRequestHeaders.Remove(headerName);
    }

    private static string Trim(string s, int max)
        => string.IsNullOrEmpty(s) ? s : (s.Length <= max ? s : s.Substring(0, max) + "...");
}
