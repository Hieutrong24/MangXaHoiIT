using System;

namespace auth_service.src.Auth.Domain.Events
{
    public sealed record UserLoggedInEvent(Guid UserId, string Email, DateTime OccurredAtUtc)
    {
        public static UserLoggedInEvent Now(Guid userId, string email)
            => new(userId, email, DateTime.UtcNow);
    }
}
