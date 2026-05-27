using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CodeJudge.Infrastructure.Persistence.Mongo.Documents;

public sealed class ExecutionLogDocument
{
    [BsonId] public ObjectId Id { get; set; }
    public Guid SubmissionId { get; set; }
    public string Type { get; set; } = default!;
    public string Content { get; set; } = default!;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
