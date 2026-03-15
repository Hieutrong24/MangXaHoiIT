SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

USE master;
GO

IF DB_ID(N'UserDB') IS NOT NULL
BEGIN
    ALTER DATABASE UserDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE UserDB;
END
GO

CREATE DATABASE UserDB;
GO

USE UserDB;
GO

/* =========================================================
   USER-SERVICE DATABASE: UserDB
   ========================================================= */

/* ---------- Users ---------- */
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
    Status         TINYINT          NOT NULL CONSTRAINT DF_Users_Status DEFAULT (1),
    CreatedAt      DATETIME2(7)     NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt      DATETIME2(7)     NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT CK_Users_Status CHECK (Status IN (1, 2, 3)),
    CONSTRAINT CK_Users_EnrollmentYear CHECK (EnrollmentYear IS NULL OR (EnrollmentYear BETWEEN 2000 AND 2100))
);
GO

CREATE UNIQUE INDEX UX_Users_StudentCode ON dbo.Users(StudentCode);
GO
CREATE UNIQUE INDEX UX_Users_Username ON dbo.Users(Username);
GO
CREATE UNIQUE INDEX UX_Users_TDMUEmail ON dbo.Users(TDMUEmail);
GO
CREATE INDEX IX_Users_Status ON dbo.Users(Status);
GO

/* ---------- UserSettings ---------- */
CREATE TABLE dbo.UserSettings
(
    UserId          UNIQUEIDENTIFIER NOT NULL,
    PrivacyLevel    TINYINT          NOT NULL CONSTRAINT DF_UserSettings_PrivacyLevel DEFAULT (1),
    AllowDM         BIT              NOT NULL CONSTRAINT DF_UserSettings_AllowDM DEFAULT (1),
    NotifyPrefsJson NVARCHAR(MAX)    NULL,
    UpdatedAt       DATETIME2(7)     NOT NULL CONSTRAINT DF_UserSettings_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserSettings PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT FK_UserSettings_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserSettings_PrivacyLevel CHECK (PrivacyLevel IN (1, 2, 3, 4)),
    CONSTRAINT CK_UserSettings_NotifyPrefsJson CHECK (NotifyPrefsJson IS NULL OR ISJSON(NotifyPrefsJson) = 1)
);
GO

/* ---------- UserLinks ---------- */
CREATE TABLE dbo.UserLinks
(
    LinkId     UNIQUEIDENTIFIER NOT NULL,
    UserId     UNIQUEIDENTIFIER NOT NULL,
    Type       NVARCHAR(30)     NOT NULL,
    Url        NVARCHAR(500)    NOT NULL,
    CreatedAt  DATETIME2(7)     NOT NULL CONSTRAINT DF_UserLinks_CreatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserLinks PRIMARY KEY CLUSTERED (LinkId),
    CONSTRAINT FK_UserLinks_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserLinks_Type CHECK (Type IN ('github', 'linkedin', 'portfolio', 'facebook', 'other'))
);
GO

CREATE INDEX IX_UserLinks_UserId ON dbo.UserLinks(UserId);
GO

/* ---------- Follows ---------- */
CREATE TABLE dbo.Follows
(
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    FolloweeId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt  DATETIME2(7)     NOT NULL CONSTRAINT DF_Follows_CreatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Follows PRIMARY KEY CLUSTERED (FollowerId, FolloweeId),
    CONSTRAINT FK_Follows_Follower FOREIGN KEY (FollowerId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Follows_Followee FOREIGN KEY (FolloweeId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_Follows_NotSelf CHECK (FollowerId <> FolloweeId)
);
GO

CREATE INDEX IX_Follows_FolloweeId_CreatedAt
    ON dbo.Follows(FolloweeId, CreatedAt DESC);
GO

CREATE INDEX IX_Follows_FollowerId_CreatedAt
    ON dbo.Follows(FollowerId, CreatedAt DESC);
GO

/* ---------- FriendRequests ---------- */
CREATE TABLE dbo.FriendRequests
(
    RequestId    UNIQUEIDENTIFIER NOT NULL,
    FromUserId   UNIQUEIDENTIFIER NOT NULL,
    ToUserId     UNIQUEIDENTIFIER NOT NULL,
    Status       TINYINT          NOT NULL CONSTRAINT DF_FriendRequests_Status DEFAULT (1),
    IsActive     BIT              NOT NULL CONSTRAINT DF_FriendRequests_IsActive DEFAULT (1),
    Message      NVARCHAR(200)    NULL,
    CreatedAt    DATETIME2(7)     NOT NULL CONSTRAINT DF_FriendRequests_CreatedAt DEFAULT (SYSUTCDATETIME()),
    RespondedAt  DATETIME2(7)     NULL,

    CONSTRAINT PK_FriendRequests PRIMARY KEY CLUSTERED (RequestId),
    CONSTRAINT FK_FriendRequests_FromUser FOREIGN KEY (FromUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_FriendRequests_ToUser FOREIGN KEY (ToUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_FriendRequests_Status CHECK (Status IN (1, 2, 3, 4)),
    CONSTRAINT CK_FriendRequests_NotSelf CHECK (FromUserId <> ToUserId),
    CONSTRAINT CK_FriendRequests_RespondedAt CHECK (RespondedAt IS NULL OR RespondedAt >= CreatedAt),
    CONSTRAINT CK_FriendRequests_ActiveConsistency CHECK
    (
        (Status = 1 AND IsActive = 1)
        OR
        (Status IN (2, 3, 4) AND IsActive = 0)
    )
);
GO

CREATE UNIQUE INDEX UX_FriendRequests_Active_From_To
    ON dbo.FriendRequests(FromUserId, ToUserId)
    WHERE IsActive = 1;
GO

CREATE INDEX IX_FriendRequests_ToUser_Status_CreatedAt
    ON dbo.FriendRequests(ToUserId, Status, CreatedAt DESC);
GO

CREATE INDEX IX_FriendRequests_FromUser_CreatedAt
    ON dbo.FriendRequests(FromUserId, CreatedAt DESC);
GO

/* ---------- Blocks ---------- */
CREATE TABLE dbo.Blocks
(
    BlockerId UNIQUEIDENTIFIER NOT NULL,
    BlockedId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2(7)     NOT NULL CONSTRAINT DF_Blocks_CreatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Blocks PRIMARY KEY CLUSTERED (BlockerId, BlockedId),
    CONSTRAINT FK_Blocks_Blocker FOREIGN KEY (BlockerId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_Blocks_Blocked FOREIGN KEY (BlockedId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_Blocks_NotSelf CHECK (BlockerId <> BlockedId)
);
GO

CREATE INDEX IX_Blocks_BlockedId ON dbo.Blocks(BlockedId);
GO

/* ---------- User_OutboxEvents ---------- */
CREATE TABLE dbo.User_OutboxEvents
(
    EventId      UNIQUEIDENTIFIER NOT NULL,
    AggregateId  UNIQUEIDENTIFIER NOT NULL,
    EventType    NVARCHAR(100)    NOT NULL,
    PayloadJson  NVARCHAR(MAX)    NOT NULL,
    OccurredAt   DATETIME2(7)     NOT NULL CONSTRAINT DF_User_Outbox_OccurredAt DEFAULT (SYSUTCDATETIME()),
    ProcessedAt  DATETIME2(7)     NULL,
    TraceId      NVARCHAR(100)    NULL,

    CONSTRAINT PK_User_OutboxEvents PRIMARY KEY CLUSTERED (EventId),
    CONSTRAINT CK_User_OutboxEvents_PayloadJson CHECK (ISJSON(PayloadJson) = 1)
);
GO

CREATE INDEX IX_User_OutboxEvents_ProcessedAt_OccurredAt
    ON dbo.User_OutboxEvents(ProcessedAt, OccurredAt);
GO