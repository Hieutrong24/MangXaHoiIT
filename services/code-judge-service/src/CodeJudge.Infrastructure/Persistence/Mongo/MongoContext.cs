using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CodeJudge.Infrastructure.Persistence.Mongo;

public sealed class MongoOptions
{
    public string ConnectionString { get; set; } = default!;
    public string Database { get; set; } = default!;
}

public sealed class MongoContext
{
    public IMongoDatabase Db { get; }

    public MongoContext(IOptions<MongoOptions> opt)
    {
        var client = new MongoClient(opt.Value.ConnectionString);
        Db = client.GetDatabase(opt.Value.Database);
    }
}
