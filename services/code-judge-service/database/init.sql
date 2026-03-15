USE master;
GO

IF DB_ID(N'JudgeDB') IS NOT NULL
BEGIN
    ALTER DATABASE JudgeDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE JudgeDB;
END
GO

CREATE DATABASE JudgeDB;
GO

USE JudgeDB;
GO

/* =========================================================
   CODE-JUDGE-SERVICE DATABASE: JudgeDB
   ========================================================= */

/* ---------- Judge_Problems ---------- */
CREATE TABLE dbo.Judge_Problems
(
    ProblemId        UNIQUEIDENTIFIER NOT NULL,
    Title            NVARCHAR(200)    NOT NULL,
    Slug             NVARCHAR(200)    NOT NULL,
    Difficulty       TINYINT          NOT NULL,
    TimeLimitMs      INT              NOT NULL,
    MemoryLimitMB    INT              NOT NULL,
    Statement        NVARCHAR(MAX)    NOT NULL,
    CreatedByUserId  UNIQUEIDENTIFIER NOT NULL,
    IsPublic         BIT              NOT NULL CONSTRAINT DF_Judge_Problems_IsPublic DEFAULT (1),
    Status           TINYINT          NOT NULL CONSTRAINT DF_Judge_Problems_Status DEFAULT (1),
    CreatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_Judge_Problems_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_Judge_Problems_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Judge_Problems PRIMARY KEY CLUSTERED (ProblemId),
    CONSTRAINT CK_Judge_Problems_Difficulty CHECK (Difficulty IN (1,2,3,4,5)),
    CONSTRAINT CK_Judge_Problems_TimeLimit CHECK (TimeLimitMs BETWEEN 100 AND 60000),
    CONSTRAINT CK_Judge_Problems_MemoryLimit CHECK (MemoryLimitMB BETWEEN 16 AND 4096),
    CONSTRAINT CK_Judge_Problems_Status CHECK (Status IN (1,2,3))
);
GO

CREATE UNIQUE INDEX UX_Judge_Problems_Slug
    ON dbo.Judge_Problems(Slug);
GO

CREATE INDEX IX_Judge_Problems_IsPublic_Difficulty
    ON dbo.Judge_Problems(IsPublic, Difficulty);
GO

/* ---------- Judge_TestCases ---------- */
CREATE TABLE dbo.Judge_TestCases
(
    TestCaseId  UNIQUEIDENTIFIER NOT NULL,
    ProblemId   UNIQUEIDENTIFIER NOT NULL,
    InputData   VARBINARY(MAX)   NOT NULL,
    OutputData  VARBINARY(MAX)   NOT NULL,
    IsSample    BIT              NOT NULL CONSTRAINT DF_Judge_TestCases_IsSample DEFAULT (0),
    Score       INT              NOT NULL CONSTRAINT DF_Judge_TestCases_Score DEFAULT (0),
    OrderNo     INT              NOT NULL,

    CONSTRAINT PK_Judge_TestCases PRIMARY KEY CLUSTERED (TestCaseId),
    CONSTRAINT FK_Judge_TestCases_Problems FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId),
    CONSTRAINT CK_Judge_TestCases_Score CHECK (Score >= 0),
    CONSTRAINT CK_Judge_TestCases_OrderNo CHECK (OrderNo >= 1)
);
GO

CREATE UNIQUE INDEX UX_Judge_TestCases_Problem_OrderNo
    ON dbo.Judge_TestCases(ProblemId, OrderNo);
GO

CREATE INDEX IX_Judge_TestCases_ProblemId_OrderNo
    ON dbo.Judge_TestCases(ProblemId, OrderNo);
GO

/* ---------- Judge_Languages ---------- */
CREATE TABLE dbo.Judge_Languages
(
    LanguageId  INT IDENTITY(1,1) NOT NULL,
    Name        NVARCHAR(50)      NOT NULL,
    Compiler    NVARCHAR(50)      NOT NULL,
    Version     NVARCHAR(50)      NULL,
    IsEnabled   BIT               NOT NULL CONSTRAINT DF_Judge_Languages_IsEnabled DEFAULT (1),

    CONSTRAINT PK_Judge_Languages PRIMARY KEY CLUSTERED (LanguageId)
);
GO

CREATE UNIQUE INDEX UX_Judge_Languages_Name
    ON dbo.Judge_Languages(Name);
GO

CREATE INDEX IX_Judge_Languages_IsEnabled
    ON dbo.Judge_Languages(IsEnabled);
GO

/* ---------- Judge_Submissions ---------- */
CREATE TABLE dbo.Judge_Submissions
(
    SubmissionId     UNIQUEIDENTIFIER NOT NULL,
    ProblemId        UNIQUEIDENTIFIER NOT NULL,
    UserId           UNIQUEIDENTIFIER NOT NULL,
    LanguageId       INT              NOT NULL,
    SourceCode       NVARCHAR(MAX)    NOT NULL,
    CodeHash         BINARY(32)       NOT NULL,
    SubmittedAt      DATETIME2(7)     NOT NULL CONSTRAINT DF_Judge_Submissions_SubmittedAt DEFAULT (SYSUTCDATETIME()),
    Status           TINYINT          NOT NULL CONSTRAINT DF_Judge_Submissions_Status DEFAULT (1),
    TotalTimeMs      INT              NULL,
    TotalMemoryKB    INT              NULL,
    Score            INT              NULL,
    CompilerMessage  NVARCHAR(2000)   NULL,

    CONSTRAINT PK_Judge_Submissions PRIMARY KEY CLUSTERED (SubmissionId),
    CONSTRAINT FK_Judge_Submissions_Problems FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId),
    CONSTRAINT FK_Judge_Submissions_Languages FOREIGN KEY (LanguageId) REFERENCES dbo.Judge_Languages(LanguageId),
    CONSTRAINT CK_Judge_Submissions_Status CHECK (Status IN (1,2,3,4,5,6,7,8)),
    CONSTRAINT CK_Judge_Submissions_TotalTime CHECK (TotalTimeMs IS NULL OR TotalTimeMs >= 0),
    CONSTRAINT CK_Judge_Submissions_TotalMemory CHECK (TotalMemoryKB IS NULL OR TotalMemoryKB >= 0),
    CONSTRAINT CK_Judge_Submissions_Score CHECK (Score IS NULL OR Score >= 0)
);
GO

CREATE INDEX IX_Judge_Submissions_UserId_SubmittedAt
    ON dbo.Judge_Submissions(UserId, SubmittedAt DESC);
GO

CREATE INDEX IX_Judge_Submissions_ProblemId_SubmittedAt
    ON dbo.Judge_Submissions(ProblemId, SubmittedAt DESC);
GO

CREATE INDEX IX_Judge_Submissions_Status_SubmittedAt
    ON dbo.Judge_Submissions(Status, SubmittedAt DESC);
GO

CREATE INDEX IX_Judge_Submissions_Problem_User_Status_SubmittedAt
    ON dbo.Judge_Submissions(ProblemId, UserId, Status, SubmittedAt DESC);
GO

/* ---------- Judge_SubmissionTestResults ---------- */
CREATE TABLE dbo.Judge_SubmissionTestResults
(
    Id           BIGINT IDENTITY(1,1) NOT NULL,
    SubmissionId UNIQUEIDENTIFIER     NOT NULL,
    TestCaseId   UNIQUEIDENTIFIER     NOT NULL,
    Status       TINYINT              NOT NULL,
    TimeMs       INT                  NOT NULL,
    MemoryKB     INT                  NOT NULL,
    ErrorMessage NVARCHAR(1000)       NULL,
    CreatedAt    DATETIME2(7)         NOT NULL CONSTRAINT DF_Judge_TestResults_CreatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Judge_SubmissionTestResults PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Judge_TestResults_Submissions FOREIGN KEY (SubmissionId) REFERENCES dbo.Judge_Submissions(SubmissionId),
    CONSTRAINT FK_Judge_TestResults_TestCases FOREIGN KEY (TestCaseId) REFERENCES dbo.Judge_TestCases(TestCaseId),
    CONSTRAINT CK_Judge_TestResults_Status CHECK (Status IN (1,2,3,4,5,6)),
    CONSTRAINT CK_Judge_TestResults_Time CHECK (TimeMs >= 0),
    CONSTRAINT CK_Judge_TestResults_Memory CHECK (MemoryKB >= 0)
);
GO

CREATE UNIQUE INDEX UX_Judge_TestResults_Submission_TestCase
    ON dbo.Judge_SubmissionTestResults(SubmissionId, TestCaseId);
GO

CREATE INDEX IX_Judge_TestResults_SubmissionId
    ON dbo.Judge_SubmissionTestResults(SubmissionId);
GO

/* ---------- Judge_UserProblemStats ---------- */
CREATE TABLE dbo.Judge_UserProblemStats
(
    UserId          UNIQUEIDENTIFIER NOT NULL,
    ProblemId       UNIQUEIDENTIFIER NOT NULL,
    BestStatus      TINYINT          NOT NULL,
    BestTimeMs      INT              NULL,
    BestMemoryKB    INT              NULL,
    Attempts        INT              NOT NULL CONSTRAINT DF_Judge_Stats_Attempts DEFAULT (0),
    LastSubmittedAt DATETIME2(7)     NOT NULL,
    FirstAcceptedAt DATETIME2(7)     NULL,

    CONSTRAINT PK_Judge_UserProblemStats PRIMARY KEY CLUSTERED (UserId, ProblemId),
    CONSTRAINT FK_Judge_Stats_Problems FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId),
    CONSTRAINT CK_Judge_Stats_Attempts CHECK (Attempts >= 0),
    CONSTRAINT CK_Judge_Stats_BestTime CHECK (BestTimeMs IS NULL OR BestTimeMs >= 0),
    CONSTRAINT CK_Judge_Stats_BestMemory CHECK (BestMemoryKB IS NULL OR BestMemoryKB >= 0)
);
GO

CREATE INDEX IX_Judge_Stats_Problem_BestStatus_BestTime
    ON dbo.Judge_UserProblemStats(ProblemId, BestStatus, BestTimeMs);
GO

CREATE INDEX IX_Judge_Stats_User_LastSubmittedAt
    ON dbo.Judge_UserProblemStats(UserId, LastSubmittedAt DESC);
GO

/* ---------- Judge_OutboxEvents ---------- */
CREATE TABLE dbo.Judge_OutboxEvents
(
    EventId      UNIQUEIDENTIFIER NOT NULL,
    AggregateId  UNIQUEIDENTIFIER NOT NULL,
    EventType    NVARCHAR(100)    NOT NULL,
    PayloadJson  NVARCHAR(MAX)    NOT NULL,
    OccurredAt   DATETIME2(7)     NOT NULL CONSTRAINT DF_Judge_Outbox_OccurredAt DEFAULT (SYSUTCDATETIME()),
    ProcessedAt  DATETIME2(7)     NULL,
    TraceId      NVARCHAR(100)    NULL,

    CONSTRAINT PK_Judge_OutboxEvents PRIMARY KEY CLUSTERED (EventId),
    CONSTRAINT CK_Judge_OutboxEvents_PayloadJson CHECK (ISJSON(PayloadJson) = 1)
);
GO

CREATE INDEX IX_Judge_OutboxEvents_ProcessedAt_OccurredAt
    ON dbo.Judge_OutboxEvents(ProcessedAt, OccurredAt);
GO