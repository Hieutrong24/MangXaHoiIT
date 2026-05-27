namespace User.Application.DTOs;

public sealed record TrustSafetyDto(
    Guid UserId,
    double Score,
    string Level,
    int AccountAgeDays,
    bool HasVerifiedSchoolEmail,
    int ReportCount,
    int ModerationActionCount,
    IReadOnlyList<string> Signals
);
