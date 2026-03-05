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
