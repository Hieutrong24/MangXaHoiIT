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
        var parsedStatus = Enum.IsDefined(typeof(ProblemStatus), req.Status) ? (ProblemStatus)req.Status : (req.IsPublic ? ProblemStatus.Active : ProblemStatus.Hidden);

        var p = new Problem
        {
            ProblemId = Guid.NewGuid(),
            Title = req.Title.Trim(),
            Slug = string.IsNullOrWhiteSpace(req.Slug) ? Slugify(req.Title) : req.Slug.Trim(),
            Difficulty = req.Difficulty,
            DifficultyLevel = req.Difficulty,
            TimeLimitMs = req.TimeLimitMs,
            MemoryLimitMB = req.MemoryLimitMB,
            Statement = req.Statement,
            CreatedByUserId = req.CreatedByUserId,
            IsPublic = req.IsPublic,
            Status = parsedStatus,
            ProblemType = string.IsNullOrWhiteSpace(req.ProblemType) ? "code" : req.ProblemType.Trim(),
            Topic = NormalizeNullable(req.Topic),
            SkillTag = NormalizeNullable(req.SkillTag),
            InputFormat = NormalizeNullable(req.InputFormat),
            OutputFormat = NormalizeNullable(req.OutputFormat),
            ConstraintsText = NormalizeNullable(req.ConstraintsText),
            HintText = NormalizeNullable(req.HintText),
            EditorialText = NormalizeNullable(req.EditorialText),
            IsFeatured = req.IsFeatured ?? false,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _problems.AddAsync(p, ct);
        await _uow.SaveChangesAsync(ct);
        return ToDto(p);
    }

    public async Task<ProblemDto?> UpdateAsync(Guid id, UpdateProblemRequest req, CancellationToken ct = default)
    {
        var p = await _problems.GetAsync(id, ct);
        if (p is null) return null;

        if (!string.IsNullOrWhiteSpace(req.Title)) p.Title = req.Title.Trim();
        if (!string.IsNullOrWhiteSpace(req.Slug)) p.Slug = req.Slug.Trim();
        if (req.Difficulty.HasValue)
        {
            p.Difficulty = req.Difficulty.Value;
            p.DifficultyLevel = req.Difficulty.Value;
        }
        if (req.TimeLimitMs.HasValue) p.TimeLimitMs = req.TimeLimitMs.Value;
        if (req.MemoryLimitMB.HasValue) p.MemoryLimitMB = req.MemoryLimitMB.Value;
        if (req.Statement is not null) p.Statement = req.Statement;
        if (req.IsPublic.HasValue) p.IsPublic = req.IsPublic.Value;
        if (req.Status.HasValue && Enum.IsDefined(typeof(ProblemStatus), req.Status.Value)) p.Status = (ProblemStatus)req.Status.Value;
        else if (req.IsPublic.HasValue) p.Status = req.IsPublic.Value ? ProblemStatus.Active : ProblemStatus.Hidden;

        if (req.ProblemType is not null) p.ProblemType = string.IsNullOrWhiteSpace(req.ProblemType) ? "code" : req.ProblemType.Trim();
        if (req.Topic is not null) p.Topic = NormalizeNullable(req.Topic);
        if (req.SkillTag is not null) p.SkillTag = NormalizeNullable(req.SkillTag);
        if (req.InputFormat is not null) p.InputFormat = NormalizeNullable(req.InputFormat);
        if (req.OutputFormat is not null) p.OutputFormat = NormalizeNullable(req.OutputFormat);
        if (req.ConstraintsText is not null) p.ConstraintsText = NormalizeNullable(req.ConstraintsText);
        if (req.HintText is not null) p.HintText = NormalizeNullable(req.HintText);
        if (req.EditorialText is not null) p.EditorialText = NormalizeNullable(req.EditorialText);
        if (req.IsFeatured.HasValue) p.IsFeatured = req.IsFeatured.Value;

        p.UpdatedAt = DateTime.UtcNow;
        _problems.Update(p);
        await _uow.SaveChangesAsync(ct);
        return ToDto(p);
    }

    public async Task<ProblemDto?> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _problems.GetAsync(id, ct);
        if (p is null) return null;
        p.Status = ProblemStatus.Deleted;
        p.UpdatedAt = DateTime.UtcNow;
        _problems.Update(p);
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

    public Task<OJProblemListResponseDto> ListOjAsync(ProblemSearchRequest req, Guid? currentUserId, CancellationToken ct = default)
        => _problems.ListOjAsync(req, currentUserId, ct);

    public Task<List<FeaturedProblemDto>> ListFeaturedAsync(int limit, Guid? currentUserId, CancellationToken ct = default)
        => _problems.ListFeaturedAsync(limit, currentUserId, ct);

    public Task<ProblemOverviewDto?> GetOverviewAsync(Guid id, Guid? currentUserId, CancellationToken ct = default)
        => _problems.GetOverviewAsync(id, currentUserId, ct);

    private static ProblemDto ToDto(Problem p) =>
        new(p.ProblemId, p.Title, p.Slug, p.Statement, p.Difficulty, p.TimeLimitMs, p.MemoryLimitMB, p.IsPublic, (byte)p.Status, p.CreatedAt, p.UpdatedAt, p.ProblemType, p.Topic, p.SkillTag, p.EstimatedMinutes, p.PointsReward, p.MaxScore, p.InputFormat, p.OutputFormat, p.ConstraintsText, p.HintText, p.StarterCode, p.EditorialText, p.AllowCustomInput, p.AllowPartialScoring, p.IsFeatured);

    private static string? NormalizeNullable(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }

    private static string Slugify(string s)
    {
        s = (s ?? "").Trim().ToLowerInvariant();
        s = System.Text.RegularExpressions.Regex.Replace(s, @"\s+", "-");
        s = System.Text.RegularExpressions.Regex.Replace(s, @"[^a-z0-9\-]", "");
        return string.IsNullOrWhiteSpace(s) ? Guid.NewGuid().ToString("N") : s;
    }
}
