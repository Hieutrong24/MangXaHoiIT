/* =========================================================
   AUTH-SERVICE DATABASE: AuthDB
   ========================================================= */

IF DB_ID(N'AuthDB') IS NULL
BEGIN
    CREATE DATABASE AuthDB;
END
GO

USE AuthDB;
GO

/* ---------- Auth_Accounts ---------- */
IF OBJECT_ID(N'dbo.Auth_Accounts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auth_Accounts
    (
        UserId           UNIQUEIDENTIFIER NOT NULL,
        Email            NVARCHAR(256)     NOT NULL,
        PasswordHash     VARBINARY(256)    NOT NULL,
        PasswordAlgo     NVARCHAR(50)      NOT NULL,
        IsEmailVerified  BIT              NOT NULL CONSTRAINT DF_Auth_Accounts_IsEmailVerified DEFAULT(0),
        Status           TINYINT          NOT NULL CONSTRAINT DF_Auth_Accounts_Status DEFAULT(1),
        CreatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_Auth_Accounts_CreatedAt DEFAULT(SYSUTCDATETIME()),
        UpdatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_Auth_Accounts_UpdatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_Auth_Accounts PRIMARY KEY CLUSTERED (UserId),
        CONSTRAINT CK_Auth_Accounts_Status CHECK (Status IN (1,2,3)) -- 1=Active,2=Locked,3=Deleted
    );

    CREATE UNIQUE INDEX UX_Auth_Accounts_Email
        ON dbo.Auth_Accounts(Email);

    CREATE INDEX IX_Auth_Accounts_Status
        ON dbo.Auth_Accounts(Status);
END
GO

/* ---------- Auth_Roles ---------- */
IF OBJECT_ID(N'dbo.Auth_Roles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auth_Roles
    (
        RoleId      INT IDENTITY(1,1) NOT NULL,
        Name        NVARCHAR(50)      NOT NULL,
        Description NVARCHAR(200)     NULL,

        CONSTRAINT PK_Auth_Roles PRIMARY KEY CLUSTERED (RoleId)
    );

    CREATE UNIQUE INDEX UX_Auth_Roles_Name
        ON dbo.Auth_Roles(Name);
END
GO

/* ---------- Auth_UserRoles ---------- */
IF OBJECT_ID(N'dbo.Auth_UserRoles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auth_UserRoles
    (
        UserId     UNIQUEIDENTIFIER NOT NULL,
        RoleId     INT              NOT NULL,
        AssignedAt DATETIME2(7)     NOT NULL CONSTRAINT DF_Auth_UserRoles_AssignedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_Auth_UserRoles PRIMARY KEY CLUSTERED (UserId, RoleId),
        CONSTRAINT FK_Auth_UserRoles_Accounts FOREIGN KEY (UserId) REFERENCES dbo.Auth_Accounts(UserId),
        CONSTRAINT FK_Auth_UserRoles_Roles    FOREIGN KEY (RoleId) REFERENCES dbo.Auth_Roles(RoleId)
    );

    CREATE INDEX IX_Auth_UserRoles_RoleId_UserId
        ON dbo.Auth_UserRoles(RoleId, UserId);
END
GO

/* ---------- Auth_RefreshTokens ---------- */
IF OBJECT_ID(N'dbo.Auth_RefreshTokens', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auth_RefreshTokens
    (
        TokenId            UNIQUEIDENTIFIER NOT NULL,
        UserId             UNIQUEIDENTIFIER NOT NULL,
        TokenHash          BINARY(32)        NOT NULL, -- SHA-256(token)
        IssuedAt           DATETIME2(7)      NOT NULL,
        ExpiresAt          DATETIME2(7)      NOT NULL,
        RevokedAt          DATETIME2(7)      NULL,
        ReplacedByTokenId  UNIQUEIDENTIFIER  NULL,
        DeviceId           NVARCHAR(128)     NULL,
        IpAddress          NVARCHAR(64)      NULL,
        UserAgent          NVARCHAR(256)     NULL,

        CONSTRAINT PK_Auth_RefreshTokens PRIMARY KEY CLUSTERED (TokenId),
        CONSTRAINT FK_Auth_RefreshTokens_Accounts FOREIGN KEY (UserId) REFERENCES dbo.Auth_Accounts(UserId),

        CONSTRAINT CK_Auth_RefreshTokens_ExpiresAfterIssued CHECK (ExpiresAt > IssuedAt),
        CONSTRAINT CK_Auth_RefreshTokens_RevokedAt CHECK (RevokedAt IS NULL OR RevokedAt >= IssuedAt)
    );

    CREATE UNIQUE INDEX UX_Auth_RefreshTokens_TokenHash
        ON dbo.Auth_RefreshTokens(TokenHash);

    CREATE INDEX IX_Auth_RefreshTokens_UserId_ExpiresAt
        ON dbo.Auth_RefreshTokens(UserId, ExpiresAt DESC);

    CREATE INDEX IX_Auth_RefreshTokens_ExpiresAt
        ON dbo.Auth_RefreshTokens(ExpiresAt);
END
GO

/* ---------- Auth_LoginAuditLogs ---------- */
IF OBJECT_ID(N'dbo.Auth_LoginAuditLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auth_LoginAuditLogs
    (
        Id            BIGINT IDENTITY(1,1) NOT NULL,
        UserId        UNIQUEIDENTIFIER     NULL,
        Email         NVARCHAR(256)        NOT NULL,
        Success       BIT                 NOT NULL,
        FailureReason NVARCHAR(200)        NULL,
        IpAddress     NVARCHAR(64)         NULL,
        UserAgent     NVARCHAR(256)        NULL,
        CreatedAt     DATETIME2(7)         NOT NULL CONSTRAINT DF_Auth_LoginAuditLogs_CreatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_Auth_LoginAuditLogs PRIMARY KEY CLUSTERED (Id)
    );

    CREATE INDEX IX_Auth_LoginAuditLogs_Email_CreatedAt
        ON dbo.Auth_LoginAuditLogs(Email, CreatedAt DESC);

    CREATE INDEX IX_Auth_LoginAuditLogs_UserId_CreatedAt
        ON dbo.Auth_LoginAuditLogs(UserId, CreatedAt DESC);
END
GO

/* ---------- Auth_OutboxEvents (Khuyến nghị) ---------- */
IF OBJECT_ID(N'dbo.Auth_OutboxEvents', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auth_OutboxEvents
    (
        EventId      UNIQUEIDENTIFIER NOT NULL,
        AggregateId  UNIQUEIDENTIFIER NOT NULL,
        EventType    NVARCHAR(100)    NOT NULL,
        PayloadJson  NVARCHAR(MAX)    NOT NULL,
        OccurredAt   DATETIME2(7)     NOT NULL CONSTRAINT DF_Auth_OutboxEvents_OccurredAt DEFAULT(SYSUTCDATETIME()),
        ProcessedAt  DATETIME2(7)     NULL,
        TraceId      NVARCHAR(100)    NULL,

        CONSTRAINT PK_Auth_OutboxEvents PRIMARY KEY CLUSTERED (EventId),
        CONSTRAINT CK_Auth_OutboxEvents_PayloadJson CHECK (ISJSON(PayloadJson) = 1)
    );

    CREATE INDEX IX_Auth_OutboxEvents_ProcessedAt_OccurredAt
        ON dbo.Auth_OutboxEvents(ProcessedAt, OccurredAt);
END
GO


/* =========================================================
   USER-SERVICE DATABASE: UserDB
   ========================================================= */

IF DB_ID(N'UserDB') IS NULL
BEGIN
    CREATE DATABASE UserDB;
END
GO

USE UserDB;
GO

/* ---------- Users ---------- */
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        UserId         UNIQUEIDENTIFIER NOT NULL,
        StudentCode    NVARCHAR(20)     NOT NULL,
        Username       NVARCHAR(50)     NOT NULL,
        FullName       NVARCHAR(120)    NOT NULL,
        TDMUEmail      NVARCHAR(256)    NULL,
        Department     NVARCHAR(100)    NULL,
        Major          NVARCHAR(100)    NULL,
        ClassName      NVARCHAR(50)     NULL,
        EnrollmentYear SMALLINT         NULL,
        AvatarUrl      NVARCHAR(500)    NULL,
        CoverUrl       NVARCHAR(500)    NULL,
        Bio            NVARCHAR(500)    NULL,
        Status         TINYINT          NOT NULL CONSTRAINT DF_Users_Status DEFAULT(1),
        CreatedAt      DATETIME2(7)     NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT(SYSUTCDATETIME()),
        UpdatedAt      DATETIME2(7)     NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId),
        CONSTRAINT CK_Users_Status CHECK (Status IN (1,2,3)), -- 1=Active,2=Blocked,3=Deleted
        CONSTRAINT CK_Users_EnrollmentYear CHECK (EnrollmentYear IS NULL OR (EnrollmentYear BETWEEN 2000 AND 2100))
    );

    CREATE UNIQUE INDEX UX_Users_StudentCode ON dbo.Users(StudentCode);
    CREATE UNIQUE INDEX UX_Users_Username    ON dbo.Users(Username);
    CREATE UNIQUE INDEX UX_Users_TDMUEmail   ON dbo.Users(TDMUEmail); -- cho phép nhiều NULL

    CREATE INDEX IX_Users_Status ON dbo.Users(Status);
END
GO

/* ---------- UserSettings ---------- */
IF OBJECT_ID(N'dbo.UserSettings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserSettings
    (
        UserId         UNIQUEIDENTIFIER NOT NULL,
        PrivacyLevel   TINYINT          NOT NULL CONSTRAINT DF_UserSettings_PrivacyLevel DEFAULT(1),
        AllowDM        BIT              NOT NULL CONSTRAINT DF_UserSettings_AllowDM DEFAULT(1),
        NotifyPrefsJson NVARCHAR(MAX)   NULL,
        UpdatedAt      DATETIME2(7)     NOT NULL CONSTRAINT DF_UserSettings_UpdatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_UserSettings PRIMARY KEY CLUSTERED (UserId),
        CONSTRAINT FK_UserSettings_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT CK_UserSettings_PrivacyLevel CHECK (PrivacyLevel IN (1,2,3,4)),
        CONSTRAINT CK_UserSettings_NotifyPrefsJson CHECK (NotifyPrefsJson IS NULL OR ISJSON(NotifyPrefsJson) = 1)
    );
END
GO

/* ---------- UserLinks ---------- */
IF OBJECT_ID(N'dbo.UserLinks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserLinks
    (
        LinkId     UNIQUEIDENTIFIER NOT NULL,
        UserId     UNIQUEIDENTIFIER NOT NULL,
        Type       NVARCHAR(30)     NOT NULL,
        Url        NVARCHAR(500)    NOT NULL,
        CreatedAt  DATETIME2(7)     NOT NULL CONSTRAINT DF_UserLinks_CreatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_UserLinks PRIMARY KEY CLUSTERED (LinkId),
        CONSTRAINT FK_UserLinks_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT CK_UserLinks_Type CHECK (Type IN ('github','linkedin','portfolio','facebook','other'))
    );

    CREATE INDEX IX_UserLinks_UserId
        ON dbo.UserLinks(UserId);

    -- (Tuỳ chọn) mỗi user chỉ 1 link cho mỗi Type:
    -- CREATE UNIQUE INDEX UX_UserLinks_UserId_Type ON dbo.UserLinks(UserId, Type);
END
GO

/* ---------- Follows ---------- */
IF OBJECT_ID(N'dbo.Follows', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Follows
    (
        FollowerId UNIQUEIDENTIFIER NOT NULL,
        FolloweeId UNIQUEIDENTIFIER NOT NULL,
        CreatedAt  DATETIME2(7)     NOT NULL CONSTRAINT DF_Follows_CreatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_Follows PRIMARY KEY CLUSTERED (FollowerId, FolloweeId),
        CONSTRAINT FK_Follows_Follower FOREIGN KEY (FollowerId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Follows_Followee FOREIGN KEY (FolloweeId) REFERENCES dbo.Users(UserId),
        CONSTRAINT CK_Follows_NotSelf CHECK (FollowerId <> FolloweeId)
    );

    CREATE INDEX IX_Follows_FolloweeId_CreatedAt
        ON dbo.Follows(FolloweeId, CreatedAt DESC);

    CREATE INDEX IX_Follows_FollowerId_CreatedAt
        ON dbo.Follows(FollowerId, CreatedAt DESC);
END
GO

/* ---------- FriendRequests ---------- */
IF OBJECT_ID(N'dbo.FriendRequests', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.FriendRequests
    (
        RequestId    UNIQUEIDENTIFIER NOT NULL,
        FromUserId   UNIQUEIDENTIFIER NOT NULL,
        ToUserId     UNIQUEIDENTIFIER NOT NULL,
        Status       TINYINT          NOT NULL CONSTRAINT DF_FriendRequests_Status DEFAULT(1),
        IsActive     BIT              NOT NULL CONSTRAINT DF_FriendRequests_IsActive DEFAULT(1),
        Message      NVARCHAR(200)    NULL,
        CreatedAt    DATETIME2(7)     NOT NULL CONSTRAINT DF_FriendRequests_CreatedAt DEFAULT(SYSUTCDATETIME()),
        RespondedAt  DATETIME2(7)     NULL,

        CONSTRAINT PK_FriendRequests PRIMARY KEY CLUSTERED (RequestId),
        CONSTRAINT FK_FriendRequests_FromUser FOREIGN KEY (FromUserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_FriendRequests_ToUser   FOREIGN KEY (ToUserId)   REFERENCES dbo.Users(UserId),

        -- 1=pending, 2=accepted, 3=rejected, 4=cancelled
        CONSTRAINT CK_FriendRequests_Status CHECK (Status IN (1,2,3,4)),
        CONSTRAINT CK_FriendRequests_NotSelf CHECK (FromUserId <> ToUserId),
        CONSTRAINT CK_FriendRequests_RespondedAt CHECK (RespondedAt IS NULL OR RespondedAt >= CreatedAt),

        -- Khuyến nghị: pending thì active=1, còn lại active=0
        CONSTRAINT CK_FriendRequests_ActiveConsistency CHECK
        (
            (Status = 1 AND IsActive = 1)
            OR
            (Status IN (2,3,4) AND IsActive = 0)
        )
    );

    -- Chống spam: mỗi cặp From->To chỉ có 1 request ACTIVE tại 1 thời điểm
    CREATE UNIQUE INDEX UX_FriendRequests_Active_From_To
        ON dbo.FriendRequests(FromUserId, ToUserId)
        WHERE IsActive = 1;

    CREATE INDEX IX_FriendRequests_ToUser_Status_CreatedAt
        ON dbo.FriendRequests(ToUserId, Status, CreatedAt DESC);

    CREATE INDEX IX_FriendRequests_FromUser_CreatedAt
        ON dbo.FriendRequests(FromUserId, CreatedAt DESC);
END
GO

/* ---------- Blocks ---------- */
IF OBJECT_ID(N'dbo.Blocks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Blocks
    (
        BlockerId UNIQUEIDENTIFIER NOT NULL,
        BlockedId UNIQUEIDENTIFIER NOT NULL,
        CreatedAt DATETIME2(7)     NOT NULL CONSTRAINT DF_Blocks_CreatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_Blocks PRIMARY KEY CLUSTERED (BlockerId, BlockedId),
        CONSTRAINT FK_Blocks_Blocker FOREIGN KEY (BlockerId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Blocks_Blocked FOREIGN KEY (BlockedId) REFERENCES dbo.Users(UserId),
        CONSTRAINT CK_Blocks_NotSelf CHECK (BlockerId <> BlockedId)
    );

    CREATE INDEX IX_Blocks_BlockedId
        ON dbo.Blocks(BlockedId);
END
GO

/* ---------- User_OutboxEvents (Khuyến nghị) ---------- */
IF OBJECT_ID(N'dbo.User_OutboxEvents', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.User_OutboxEvents
    (
        EventId      UNIQUEIDENTIFIER NOT NULL,
        AggregateId  UNIQUEIDENTIFIER NOT NULL,
        EventType    NVARCHAR(100)    NOT NULL,
        PayloadJson  NVARCHAR(MAX)    NOT NULL,
        OccurredAt   DATETIME2(7)     NOT NULL CONSTRAINT DF_User_Outbox_OccurredAt DEFAULT(SYSUTCDATETIME()),
        ProcessedAt  DATETIME2(7)     NULL,
        TraceId      NVARCHAR(100)    NULL,

        CONSTRAINT PK_User_OutboxEvents PRIMARY KEY CLUSTERED (EventId),
        CONSTRAINT CK_User_OutboxEvents_PayloadJson CHECK (ISJSON(PayloadJson) = 1)
    );

    CREATE INDEX IX_User_OutboxEvents_ProcessedAt_OccurredAt
        ON dbo.User_OutboxEvents(ProcessedAt, OccurredAt);
END
GO



/* =========================================================
   CODE-JUDGE-SERVICE DATABASE: JudgeDB
   ========================================================= */

IF DB_ID(N'JudgeDB') IS NULL
BEGIN
    CREATE DATABASE JudgeDB;
END
GO

USE JudgeDB;
GO

/* ---------- Judge_Problems ---------- */
IF OBJECT_ID(N'dbo.Judge_Problems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Problems
    (
        ProblemId        UNIQUEIDENTIFIER NOT NULL,
        Title            NVARCHAR(200)    NOT NULL,
        Slug             NVARCHAR(200)    NOT NULL,
        Difficulty       TINYINT          NOT NULL,
        TimeLimitMs      INT              NOT NULL,
        MemoryLimitMB    INT              NOT NULL,
        Statement        NVARCHAR(MAX)    NOT NULL,
        CreatedByUserId  UNIQUEIDENTIFIER NOT NULL, -- tham chiếu user-service (ID-only)
        IsPublic         BIT              NOT NULL CONSTRAINT DF_Judge_Problems_IsPublic DEFAULT(1),
        Status           TINYINT          NOT NULL CONSTRAINT DF_Judge_Problems_Status DEFAULT(1),
        CreatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_Judge_Problems_CreatedAt DEFAULT(SYSUTCDATETIME()),
        UpdatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_Judge_Problems_UpdatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_Judge_Problems PRIMARY KEY CLUSTERED (ProblemId),
        CONSTRAINT CK_Judge_Problems_Difficulty CHECK (Difficulty IN (1,2,3,4,5)),
        CONSTRAINT CK_Judge_Problems_TimeLimit CHECK (TimeLimitMs BETWEEN 100 AND 60000),
        CONSTRAINT CK_Judge_Problems_MemoryLimit CHECK (MemoryLimitMB BETWEEN 16 AND 4096),
        CONSTRAINT CK_Judge_Problems_Status CHECK (Status IN (1,2,3)) -- 1=Active,2=Hidden,3=Deleted
    );

    CREATE UNIQUE INDEX UX_Judge_Problems_Slug
        ON dbo.Judge_Problems(Slug);

    CREATE INDEX IX_Judge_Problems_IsPublic_Difficulty
        ON dbo.Judge_Problems(IsPublic, Difficulty);
END
GO

/* ---------- Judge_TestCases ---------- */
IF OBJECT_ID(N'dbo.Judge_TestCases', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_TestCases
    (
        TestCaseId  UNIQUEIDENTIFIER NOT NULL,
        ProblemId   UNIQUEIDENTIFIER NOT NULL,
        InputData   VARBINARY(MAX)   NOT NULL,
        OutputData  VARBINARY(MAX)   NOT NULL,
        IsSample    BIT              NOT NULL CONSTRAINT DF_Judge_TestCases_IsSample DEFAULT(0),
        Score       INT              NOT NULL CONSTRAINT DF_Judge_TestCases_Score DEFAULT(0),
        OrderNo     INT              NOT NULL,

        CONSTRAINT PK_Judge_TestCases PRIMARY KEY CLUSTERED (TestCaseId),
        CONSTRAINT FK_Judge_TestCases_Problems FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId),
        CONSTRAINT CK_Judge_TestCases_Score CHECK (Score >= 0),
        CONSTRAINT CK_Judge_TestCases_OrderNo CHECK (OrderNo >= 1)
    );

    CREATE UNIQUE INDEX UX_Judge_TestCases_Problem_OrderNo
        ON dbo.Judge_TestCases(ProblemId, OrderNo);

    CREATE INDEX IX_Judge_TestCases_ProblemId_OrderNo
        ON dbo.Judge_TestCases(ProblemId, OrderNo);
END
GO

/* ---------- Judge_Languages ---------- */
IF OBJECT_ID(N'dbo.Judge_Languages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Languages
    (
        LanguageId  INT IDENTITY(1,1) NOT NULL,
        Name        NVARCHAR(50)      NOT NULL,
        Compiler    NVARCHAR(50)      NOT NULL,
        Version     NVARCHAR(50)      NULL,
        IsEnabled   BIT               NOT NULL CONSTRAINT DF_Judge_Languages_IsEnabled DEFAULT(1),

        CONSTRAINT PK_Judge_Languages PRIMARY KEY CLUSTERED (LanguageId)
    );

    CREATE UNIQUE INDEX UX_Judge_Languages_Name
        ON dbo.Judge_Languages(Name);

    CREATE INDEX IX_Judge_Languages_IsEnabled
        ON dbo.Judge_Languages(IsEnabled);
END
GO

/* ---------- Judge_Submissions ---------- */
IF OBJECT_ID(N'dbo.Judge_Submissions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Submissions
    (
        SubmissionId     UNIQUEIDENTIFIER NOT NULL,
        ProblemId        UNIQUEIDENTIFIER NOT NULL,
        UserId           UNIQUEIDENTIFIER NOT NULL, -- tham chiếu user-service (ID-only)
        LanguageId       INT              NOT NULL,
        SourceCode       NVARCHAR(MAX)    NOT NULL,
        CodeHash         BINARY(32)        NOT NULL, -- SHA-256(source)
        SubmittedAt      DATETIME2(7)     NOT NULL CONSTRAINT DF_Judge_Submissions_SubmittedAt DEFAULT(SYSUTCDATETIME()),
        Status           TINYINT          NOT NULL CONSTRAINT DF_Judge_Submissions_Status DEFAULT(1),
        TotalTimeMs      INT              NULL,
        TotalMemoryKB    INT              NULL,
        Score            INT              NULL,
        CompilerMessage  NVARCHAR(2000)   NULL,

        CONSTRAINT PK_Judge_Submissions PRIMARY KEY CLUSTERED (SubmissionId),
        CONSTRAINT FK_Judge_Submissions_Problems  FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId),
        CONSTRAINT FK_Judge_Submissions_Languages FOREIGN KEY (LanguageId) REFERENCES dbo.Judge_Languages(LanguageId),

        -- 1=queued,2=running,3=AC,4=WA,5=TLE,6=MLE,7=RE,8=CE
        CONSTRAINT CK_Judge_Submissions_Status CHECK (Status IN (1,2,3,4,5,6,7,8)),
        CONSTRAINT CK_Judge_Submissions_TotalTime CHECK (TotalTimeMs IS NULL OR TotalTimeMs >= 0),
        CONSTRAINT CK_Judge_Submissions_TotalMemory CHECK (TotalMemoryKB IS NULL OR TotalMemoryKB >= 0),
        CONSTRAINT CK_Judge_Submissions_Score CHECK (Score IS NULL OR Score >= 0)
    );

    CREATE INDEX IX_Judge_Submissions_UserId_SubmittedAt
        ON dbo.Judge_Submissions(UserId, SubmittedAt DESC);

    CREATE INDEX IX_Judge_Submissions_ProblemId_SubmittedAt
        ON dbo.Judge_Submissions(ProblemId, SubmittedAt DESC);

    CREATE INDEX IX_Judge_Submissions_Status_SubmittedAt
        ON dbo.Judge_Submissions(Status, SubmittedAt DESC);

    CREATE INDEX IX_Judge_Submissions_Problem_User_Status_SubmittedAt
        ON dbo.Judge_Submissions(ProblemId, UserId, Status, SubmittedAt DESC);
END
GO

/* ---------- Judge_SubmissionTestResults ---------- */
IF OBJECT_ID(N'dbo.Judge_SubmissionTestResults', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_SubmissionTestResults
    (
        Id           BIGINT IDENTITY(1,1) NOT NULL,
        SubmissionId UNIQUEIDENTIFIER     NOT NULL,
        TestCaseId   UNIQUEIDENTIFIER     NOT NULL,
        Status       TINYINT              NOT NULL,
        TimeMs       INT                  NOT NULL,
        MemoryKB     INT                  NOT NULL,
        ErrorMessage NVARCHAR(1000)       NULL,
        CreatedAt    DATETIME2(7)         NOT NULL CONSTRAINT DF_Judge_TestResults_CreatedAt DEFAULT(SYSUTCDATETIME()),

        CONSTRAINT PK_Judge_SubmissionTestResults PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT FK_Judge_TestResults_Submissions FOREIGN KEY (SubmissionId) REFERENCES dbo.Judge_Submissions(SubmissionId),
        CONSTRAINT FK_Judge_TestResults_TestCases   FOREIGN KEY (TestCaseId)   REFERENCES dbo.Judge_TestCases(TestCaseId),

        -- ví dụ: 1=pass,2=fail,3=TLE,4=MLE,5=RE,6=SKIP
        CONSTRAINT CK_Judge_TestResults_Status CHECK (Status IN (1,2,3,4,5,6)),
        CONSTRAINT CK_Judge_TestResults_Time CHECK (TimeMs >= 0),
        CONSTRAINT CK_Judge_TestResults_Memory CHECK (MemoryKB >= 0)
    );

    CREATE UNIQUE INDEX UX_Judge_TestResults_Submission_TestCase
        ON dbo.Judge_SubmissionTestResults(SubmissionId, TestCaseId);

    CREATE INDEX IX_Judge_TestResults_SubmissionId
        ON dbo.Judge_SubmissionTestResults(SubmissionId);
END
GO

/* ---------- Judge_UserProblemStats ---------- */
IF OBJECT_ID(N'dbo.Judge_UserProblemStats', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserProblemStats
    (
        UserId          UNIQUEIDENTIFIER NOT NULL,
        ProblemId       UNIQUEIDENTIFIER NOT NULL,
        BestStatus      TINYINT          NOT NULL,
        BestTimeMs      INT              NULL,
        BestMemoryKB    INT              NULL,
        Attempts        INT              NOT NULL CONSTRAINT DF_Judge_Stats_Attempts DEFAULT(0),
        LastSubmittedAt DATETIME2(7)     NOT NULL,
        FirstAcceptedAt DATETIME2(7)     NULL,

        CONSTRAINT PK_Judge_UserProblemStats PRIMARY KEY CLUSTERED (UserId, ProblemId),
        CONSTRAINT FK_Judge_Stats_Problems FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId),
        CONSTRAINT CK_Judge_Stats_Attempts CHECK (Attempts >= 0),
        CONSTRAINT CK_Judge_Stats_BestTime CHECK (BestTimeMs IS NULL OR BestTimeMs >= 0),
        CONSTRAINT CK_Judge_Stats_BestMemory CHECK (BestMemoryKB IS NULL OR BestMemoryKB >= 0)
    );

    CREATE INDEX IX_Judge_Stats_Problem_BestStatus_BestTime
        ON dbo.Judge_UserProblemStats(ProblemId, BestStatus, BestTimeMs);

    CREATE INDEX IX_Judge_Stats_User_LastSubmittedAt
        ON dbo.Judge_UserProblemStats(UserId, LastSubmittedAt DESC);
END
GO

/* ---------- Judge_OutboxEvents (Khuyến nghị) ---------- */
IF OBJECT_ID(N'dbo.Judge_OutboxEvents', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_OutboxEvents
    (
        EventId      UNIQUEIDENTIFIER NOT NULL,
        AggregateId  UNIQUEIDENTIFIER NOT NULL,
        EventType    NVARCHAR(100)    NOT NULL,
        PayloadJson  NVARCHAR(MAX)    NOT NULL,
        OccurredAt   DATETIME2(7)     NOT NULL CONSTRAINT DF_Judge_Outbox_OccurredAt DEFAULT(SYSUTCDATETIME()),
        ProcessedAt  DATETIME2(7)     NULL,
        TraceId      NVARCHAR(100)    NULL,

        CONSTRAINT PK_Judge_OutboxEvents PRIMARY KEY CLUSTERED (EventId),
        CONSTRAINT CK_Judge_OutboxEvents_PayloadJson CHECK (ISJSON(PayloadJson) = 1)
    );

    CREATE INDEX IX_Judge_OutboxEvents_ProcessedAt_OccurredAt
        ON dbo.Judge_OutboxEvents(ProcessedAt, OccurredAt);
END
GO


USE AuthDB;
CREATE LOGIN auth_user WITH PASSWORD = 'StrongPassword@123';
CREATE USER auth_user FOR LOGIN auth_user;
ALTER ROLE db_owner ADD MEMBER auth_user;


USE UserDB;
GO

IF USER_ID(N'auth_user') IS NULL
BEGIN
    CREATE USER [auth_user] FOR LOGIN [auth_user];
END
GO

EXEC sp_addrolemember N'db_owner', N'auth_user';
GO
UPDATE dbo.Auth_Accounts
SET PasswordAlgo = 'SHA2_512',
    PasswordHash = HASHBYTES('SHA2_512', CONVERT(varbinary(max), N'P@ssw0rd-User1!')),
    UpdatedAt = SYSUTCDATETIME()
WHERE Email = N'user1@demo.local';

