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
