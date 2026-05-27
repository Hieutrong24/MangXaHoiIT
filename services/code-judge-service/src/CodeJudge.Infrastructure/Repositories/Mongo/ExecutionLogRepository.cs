using CodeJudge.Application.Interfaces.Repositories;
using CodeJudge.Infrastructure.Persistence.Mongo;
using CodeJudge.Infrastructure.Persistence.Mongo.Documents;
using MongoDB.Driver;

namespace CodeJudge.Infrastructure.Repositories.Mongo;

public sealed class ExecutionLogRepository : IExecutionLogRepository
{
    private readonly IMongoCollection<ExecutionLogDocument> _col;

    public ExecutionLogRepository(MongoContext ctx)
    {
        _col = ctx.Db.GetCollection<ExecutionLogDocument>("execution_logs");
        _col.Indexes.CreateOne(new CreateIndexModel<ExecutionLogDocument>(
            Builders<ExecutionLogDocument>.IndexKeys.Ascending(x => x.SubmissionId)
        ));
    }

    public Task AppendAsync(Guid submissionId, string type, string content, CancellationToken ct = default)
        => _col.InsertOneAsync(new ExecutionLogDocument
        {
            SubmissionId = submissionId,
            Type = type,
            Content = content,
            CreatedAtUtc = DateTime.UtcNow
        }, cancellationToken: ct);
}
