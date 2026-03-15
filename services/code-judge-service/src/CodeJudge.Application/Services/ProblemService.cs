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
        new(p.ProblemId, p.Title, p.Slug, p.Statement, p.Difficulty, p.TimeLimitMs, p.MemoryLimitMB, p.IsPublic, (byte)p.Status, p.CreatedAt, p.UpdatedAt);

    private static string Slugify(string s)
    {
        s = (s ?? "").Trim().ToLowerInvariant();
        s = System.Text.RegularExpressions.Regex.Replace(s, @"\s+", "-");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"[^a-z0-9\-]", "");
        return string.IsNullOrWhiteSpace(s) ? Guid.NewGuid().ToString("N") : s;
    }
}
