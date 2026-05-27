using CodeJudge.Application.DTOs;
using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Domain.Entities;
using CodeJudge.Domain.Enums;
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

    public void Remove(Problem problem) => _db.Problems.Remove(problem);

    public async Task<OJProblemListResponseDto> ListOjAsync(ProblemSearchRequest query, Guid? currentUserId, CancellationToken ct = default)
    {
        var normalizedPage = Math.Max(1, query.Page);
        var normalizedPageSize = Math.Clamp(query.PageSize <= 0 ? 20 : query.PageSize, 1, 100);
        var keyword = (query.Keyword ?? string.Empty).Trim();

        var problemsQuery = _db.Problems
            .AsNoTracking()
            .Where(x => x.IsPublic && x.Status == ProblemStatus.Active);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            problemsQuery = problemsQuery.Where(x =>
                x.Title.Contains(keyword) ||
                x.Slug.Contains(keyword) ||
                x.Statement.Contains(keyword) ||
                (x.Topic != null && x.Topic.Contains(keyword)) ||
                (x.SkillTag != null && x.SkillTag.Contains(keyword)));
        }

        if (query.Difficulty.HasValue)
            problemsQuery = problemsQuery.Where(x => x.Difficulty == query.Difficulty.Value || x.DifficultyLevel == query.Difficulty.Value);

        if (!string.IsNullOrWhiteSpace(query.Topic))
            problemsQuery = problemsQuery.Where(x => x.Topic == query.Topic);

        if (!string.IsNullOrWhiteSpace(query.SkillTag))
            problemsQuery = problemsQuery.Where(x => x.SkillTag == query.SkillTag);

        if (query.FeaturedOnly)
            problemsQuery = problemsQuery.Where(x => x.IsFeatured);

        var problems = await problemsQuery
            .Include(x => x.TestCases)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.DifficultyLevel ?? x.Difficulty)
            .ThenBy(x => x.Title)
            .ToListAsync(ct);

        var problemIds = problems.Select(x => x.ProblemId).ToList();
        if (problemIds.Count == 0)
        {
            return new OJProblemListResponseDto(Array.Empty<OJProblemListItemDto>(), normalizedPage, normalizedPageSize, 0, 0, Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>());
        }

        var submissionAggs = await _db.Submissions
            .AsNoTracking()
            .Where(x => problemIds.Contains(x.ProblemId) && x.Status != SubmissionStatus.Queued && x.Status != SubmissionStatus.Running)
            .GroupBy(x => x.ProblemId)
            .Select(g => new SubmissionAggregate(
                g.Key,
                g.Count(),
                g.Count(x => x.Status == SubmissionStatus.AC),
                g.Count(x => x.Status != SubmissionStatus.AC && (x.Score ?? 0) > 0),
                g.Count(x => x.Status != SubmissionStatus.AC && (x.Score ?? 0) <= 0)
            ))
            .ToListAsync(ct);

        var submissionMap = submissionAggs.ToDictionary(x => x.ProblemId, x => x);
        Dictionary<Guid, UserStatusAggregate> userStatsMap = new();

        if (currentUserId.HasValue)
        {
            userStatsMap = await _db.UserProblemStats
                .AsNoTracking()
                .Where(x => x.UserId == currentUserId.Value && problemIds.Contains(x.ProblemId))
                .Select(x => new UserStatusAggregate(x.ProblemId, x.BestStatus, x.Attempts, x.FirstAcceptedAt != null))
                .ToDictionaryAsync(x => x.ProblemId, x => x, ct);
        }

        var mapped = problems.Select(problem =>
        {
            var stats = submissionMap.TryGetValue(problem.ProblemId, out var stat) ? stat : SubmissionAggregate.Empty(problem.ProblemId);
            var userStatus = ResolveUserStatus(problem.ProblemId, userStatsMap);
            var maxScore = problem.MaxScore > 0 ? problem.MaxScore : (int)Math.Round(problem.TestCases.Sum(x => Math.Max(0m, x.Score)));
            if (maxScore <= 0) maxScore = 100;

            return new OJProblemListItemDto(
                ProblemId: problem.ProblemId,
                ProblemCode: ToProblemCode(problem.Slug, problem.Title),
                Title: problem.Title,
                GroupName: DifficultyToGroup(problem.DifficultyLevel ?? problem.Difficulty),
                TypeName: InferType(problem.ProblemType, problem.Title, problem.Statement, problem.Slug),
                MaxScore: maxScore,
                AcceptanceRate: CalculateRate(stats.AcceptedCount, stats.TotalSubmissions),
                AcceptedCount: stats.AcceptedCount,
                TotalSubmissions: stats.TotalSubmissions,
                AttemptedCount: stats.TotalSubmissions,
                SampleCount: problem.TestCases.Count(x => x.IsSample),
                TestCaseCount: problem.TestCases.Count,
                UserStatus: userStatus,
                IsSolved: string.Equals(userStatus, "Đã AC", StringComparison.OrdinalIgnoreCase),
                HasTried: !string.Equals(userStatus, "Chưa thử", StringComparison.OrdinalIgnoreCase),
                Topic: problem.Topic,
                SkillTag: problem.SkillTag,
                EstimatedMinutes: problem.EstimatedMinutes,
                PointsReward: problem.PointsReward,
                ProblemType: problem.ProblemType
            );
        }).ToList();

        var availableGroups = mapped.Select(x => x.GroupName).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList();
        var availableTypes = mapped.Select(x => x.TypeName).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList();
        var availableTopics = mapped.Select(x => x.Topic).Where(x => !string.IsNullOrWhiteSpace(x)).Cast<string>().Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList();
        var availableSkillTags = mapped.Select(x => x.SkillTag).Where(x => !string.IsNullOrWhiteSpace(x)).Cast<string>().Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList();

        IEnumerable<OJProblemListItemDto> filtered = mapped;
        if (!string.IsNullOrWhiteSpace(query.GroupName)) filtered = filtered.Where(x => string.Equals(x.GroupName, query.GroupName, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(query.TypeName)) filtered = filtered.Where(x => string.Equals(x.TypeName, query.TypeName, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(query.Topic)) filtered = filtered.Where(x => string.Equals(x.Topic, query.Topic, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(query.SkillTag)) filtered = filtered.Where(x => string.Equals(x.SkillTag, query.SkillTag, StringComparison.OrdinalIgnoreCase));
        if (query.MinScore.HasValue) filtered = filtered.Where(x => x.MaxScore >= query.MinScore.Value);
        if (query.MaxScore.HasValue) filtered = filtered.Where(x => x.MaxScore <= query.MaxScore.Value);
        if (!string.IsNullOrWhiteSpace(query.UserStatus)) filtered = filtered.Where(x => string.Equals(x.UserStatus, query.UserStatus, StringComparison.OrdinalIgnoreCase));

        filtered = ApplySort(filtered, query.SortBy, query.SortDir);
        var totalItems = filtered.Count();
        var totalPages = totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (double)normalizedPageSize);
        var pageItems = filtered.Skip((normalizedPage - 1) * normalizedPageSize).Take(normalizedPageSize).ToList();

        return new OJProblemListResponseDto(pageItems, normalizedPage, normalizedPageSize, totalItems, totalPages, availableGroups, availableTypes, availableTopics, availableSkillTags);
    }

    public async Task<List<FeaturedProblemDto>> ListFeaturedAsync(int limit, Guid? currentUserId, CancellationToken ct = default)
    {
        var response = await ListOjAsync(new ProblemSearchRequest(null, null, null, null, null, null, null, 1, Math.Clamp(limit <= 0 ? 8 : limit, 1, 20), "accepted", "desc", true), currentUserId, ct);
        return response.Items.Take(limit <= 0 ? 8 : limit)
            .Select(x => new FeaturedProblemDto(x.ProblemId, x.ProblemCode, x.Title, x.GroupName, x.MaxScore, x.AcceptanceRate, x.AcceptedCount, x.TotalSubmissions, x.Topic, x.PointsReward))
            .ToList();
    }

    public async Task<ProblemOverviewDto?> GetOverviewAsync(Guid problemId, Guid? currentUserId, CancellationToken ct = default)
    {
        var problem = await _db.Problems.AsNoTracking().Include(x => x.TestCases).FirstOrDefaultAsync(x => x.ProblemId == problemId, ct);
        if (problem is null) return null;

        var stats = await _db.Submissions.AsNoTracking()
            .Where(x => x.ProblemId == problemId && x.Status != SubmissionStatus.Queued && x.Status != SubmissionStatus.Running)
            .GroupBy(x => x.ProblemId)
            .Select(g => new SubmissionAggregate(g.Key, g.Count(), g.Count(x => x.Status == SubmissionStatus.AC), g.Count(x => x.Status != SubmissionStatus.AC && (x.Score ?? 0) > 0), g.Count(x => x.Status != SubmissionStatus.AC && (x.Score ?? 0) <= 0)))
            .FirstOrDefaultAsync(ct) ?? SubmissionAggregate.Empty(problemId);

        string userStatus = "Chưa thử";
        if (currentUserId.HasValue)
        {
            var userStat = await _db.UserProblemStats.AsNoTracking()
                .Where(x => x.UserId == currentUserId.Value && x.ProblemId == problemId)
                .Select(x => new UserStatusAggregate(x.ProblemId, x.BestStatus, x.Attempts, x.FirstAcceptedAt != null))
                .FirstOrDefaultAsync(ct);
            if (userStat is not null) userStatus = ResolveUserStatus(userStat);
        }

        var maxScore = problem.MaxScore > 0 ? problem.MaxScore : (int)Math.Round(problem.TestCases.Sum(x => Math.Max(0m, x.Score)));
        if (maxScore <= 0) maxScore = 100;

        return new ProblemOverviewDto(
            ProblemId: problem.ProblemId,
            ProblemCode: ToProblemCode(problem.Slug, problem.Title),
            Title: problem.Title,
            Slug: problem.Slug,
            Statement: problem.Statement,
            Difficulty: problem.Difficulty,
            GroupName: DifficultyToGroup(problem.DifficultyLevel ?? problem.Difficulty),
            TypeName: InferType(problem.ProblemType, problem.Title, problem.Statement, problem.Slug),
            TimeLimitMs: problem.TimeLimitMs,
            MemoryLimitMB: problem.MemoryLimitMB,
            MaxScore: maxScore,
            SampleCount: problem.TestCases.Count(x => x.IsSample),
            TestCaseCount: problem.TestCases.Count,
            TotalSubmissions: stats.TotalSubmissions,
            AcceptedSubmissions: stats.AcceptedCount,
            PartialSubmissions: stats.PartialCount,
            FailedSubmissions: stats.FailedCount,
            AcceptanceRate: CalculateRate(stats.AcceptedCount, stats.TotalSubmissions),
            PartialRate: CalculateRate(stats.PartialCount, stats.TotalSubmissions),
            FailedRate: CalculateRate(stats.FailedCount, stats.TotalSubmissions),
            UserStatus: userStatus,
            Topic: problem.Topic,
            SkillTag: problem.SkillTag,
            EstimatedMinutes: problem.EstimatedMinutes,
            PointsReward: problem.PointsReward,
            ProblemType: problem.ProblemType,
            InputFormat: problem.InputFormat,
            OutputFormat: problem.OutputFormat,
            ConstraintsText: problem.ConstraintsText,
            HintText: problem.HintText,
            StarterCode: problem.StarterCode,
            EditorialText: problem.EditorialText,
            AllowCustomInput: problem.AllowCustomInput,
            AllowPartialScoring: problem.AllowPartialScoring,
            IsFeatured: problem.IsFeatured
        );
    }

    private static IEnumerable<OJProblemListItemDto> ApplySort(IEnumerable<OJProblemListItemDto> source, string? sortBy, string? sortDir)
    {
        var key = (sortBy ?? "code").Trim().ToLowerInvariant();
        var desc = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);
        return key switch
        {
            "title" => desc ? source.OrderByDescending(x => x.Title) : source.OrderBy(x => x.Title),
            "accepted" => desc ? source.OrderByDescending(x => x.AcceptedCount).ThenBy(x => x.ProblemCode) : source.OrderBy(x => x.AcceptedCount).ThenBy(x => x.ProblemCode),
            "rate" => desc ? source.OrderByDescending(x => x.AcceptanceRate).ThenByDescending(x => x.AcceptedCount) : source.OrderBy(x => x.AcceptanceRate).ThenBy(x => x.AcceptedCount),
            "score" => desc ? source.OrderByDescending(x => x.MaxScore).ThenBy(x => x.ProblemCode) : source.OrderBy(x => x.MaxScore).ThenBy(x => x.ProblemCode),
            _ => desc ? source.OrderByDescending(x => x.ProblemCode) : source.OrderBy(x => x.ProblemCode)
        };
    }

    private static double CalculateRate(int part, int total) => total <= 0 ? 0 : Math.Round(part * 100d / total, 1);

    private static string DifficultyToGroup(byte difficulty)
        => difficulty switch { <= 1 => "Dễ", 2 => "Trung Bình", 3 => "Khó", _ => "Nâng cao" };

    private static string InferType(string? problemType, string? title, string? statement, string? slug)
    {
        if (!string.IsNullOrWhiteSpace(problemType) && !string.Equals(problemType, "code", StringComparison.OrdinalIgnoreCase))
            return problemType!;

        var source = $"{title} {statement} {slug}".ToLowerInvariant();
        if (ContainsAny(source, "graph", "đồ thị", "bfs", "dfs", "dijkstra", "mst", "topo", "cạnh", "đỉnh")) return "Đồ thị";
        if (ContainsAny(source, "string", "chuỗi", "substring", "palindrome", "hash", "prefix")) return "Chuỗi";
        if (ContainsAny(source, "dp", "quy hoạch động", "knapsack", "lcs", "lis", "coin")) return "Quy hoạch động";
        if (ContainsAny(source, "queue", "stack", "heap", "priority", "deque", "ngăn xếp", "hàng đợi")) return "Cấu trúc dữ liệu";
        if (ContainsAny(source, "sort", "search", "binary", "window", "interval", "merge", "rotate")) return "Thuật toán";
        if (ContainsAny(source, "prime", "gcd", "fibonacci", "mod", "math", "nguyên tố")) return "Toán";
        if (ContainsAny(source, "array", "mảng", "subarray", "matrix", "grid")) return "Mảng";
        return "Cơ bản";
    }

    private static bool ContainsAny(string value, params string[] needles) => needles.Any(value.Contains);

    private static string ToProblemCode(string? slug, string? title)
    {
        var source = string.IsNullOrWhiteSpace(slug) ? title : slug;
        source = (source ?? "PROBLEM").Trim().ToUpperInvariant().Replace("-", "_");
        return source.Length <= 20 ? source : source[..20];
    }

    private static string ResolveUserStatus(Guid problemId, Dictionary<Guid, UserStatusAggregate> userStatsMap)
        => userStatsMap.TryGetValue(problemId, out var value) ? ResolveUserStatus(value) : "Chưa thử";

    private static string ResolveUserStatus(UserStatusAggregate value)
    {
        if (value.FirstAccepted || value.BestStatus == (byte)SubmissionStatus.AC) return "Đã AC";
        if (value.Attempts > 0) return "Đã thử";
        return "Chưa thử";
    }

    private sealed record SubmissionAggregate(Guid ProblemId, int TotalSubmissions, int AcceptedCount, int PartialCount, int FailedCount)
    {
        public static SubmissionAggregate Empty(Guid problemId) => new(problemId, 0, 0, 0, 0);
    }

    private sealed record UserStatusAggregate(Guid ProblemId, byte BestStatus, int Attempts, bool FirstAccepted);
}
