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
