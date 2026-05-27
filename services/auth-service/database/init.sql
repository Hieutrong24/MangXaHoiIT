USE master;
GO

IF DB_ID(N'AuthDB') IS NOT NULL
BEGIN
    ALTER DATABASE AuthDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE AuthDB;
END
GO

CREATE DATABASE AuthDB;
GO

USE AuthDB;
GO

/* =========================================================
   AUTH-SERVICE DATABASE: AuthDB
   ========================================================= */

/* ---------- Auth_Accounts ---------- */
CREATE TABLE dbo.Auth_Accounts
(
    UserId           UNIQUEIDENTIFIER NOT NULL,
    Email            NVARCHAR(256)    NOT NULL,
    PasswordHash     VARBINARY(256)   NOT NULL,
    PasswordAlgo     NVARCHAR(50)     NOT NULL,
    IsEmailVerified  BIT              NOT NULL CONSTRAINT DF_Auth_Accounts_IsEmailVerified DEFAULT (0),
    Status           TINYINT          NOT NULL CONSTRAINT DF_Auth_Accounts_Status DEFAULT (1),
    CreatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_Auth_Accounts_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_Auth_Accounts_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Auth_Accounts PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT CK_Auth_Accounts_Status CHECK (Status IN (1, 2, 3))
);
GO

CREATE UNIQUE INDEX UX_Auth_Accounts_Email
    ON dbo.Auth_Accounts(Email);
GO

CREATE INDEX IX_Auth_Accounts_Status
    ON dbo.Auth_Accounts(Status);
GO

/* ---------- Auth_Roles ---------- */
CREATE TABLE dbo.Auth_Roles
(
    RoleId      INT IDENTITY(1,1) NOT NULL,
    Name        NVARCHAR(50)      NOT NULL,
    Description NVARCHAR(200)     NULL,

    CONSTRAINT PK_Auth_Roles PRIMARY KEY CLUSTERED (RoleId)
);
GO

CREATE UNIQUE INDEX UX_Auth_Roles_Name
    ON dbo.Auth_Roles(Name);
GO

/* ---------- Auth_UserRoles ---------- */
CREATE TABLE dbo.Auth_UserRoles
(
    UserId     UNIQUEIDENTIFIER NOT NULL,
    RoleId     INT              NOT NULL,
    AssignedAt DATETIME2(7)     NOT NULL CONSTRAINT DF_Auth_UserRoles_AssignedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Auth_UserRoles PRIMARY KEY CLUSTERED (UserId, RoleId),
    CONSTRAINT FK_Auth_UserRoles_Accounts FOREIGN KEY (UserId) REFERENCES dbo.Auth_Accounts(UserId),
    CONSTRAINT FK_Auth_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Auth_Roles(RoleId)
);
GO

CREATE INDEX IX_Auth_UserRoles_RoleId_UserId
    ON dbo.Auth_UserRoles(RoleId, UserId);
GO

/* ---------- Auth_RefreshTokens ---------- */
CREATE TABLE dbo.Auth_RefreshTokens
(
    TokenId            UNIQUEIDENTIFIER NOT NULL,
    UserId             UNIQUEIDENTIFIER NOT NULL,
    TokenHash          BINARY(32)       NOT NULL,
    IssuedAt           DATETIME2(7)     NOT NULL,
    ExpiresAt          DATETIME2(7)     NOT NULL,
    RevokedAt          DATETIME2(7)     NULL,
    ReplacedByTokenId  UNIQUEIDENTIFIER NULL,
    DeviceId           NVARCHAR(128)    NULL,
    IpAddress          NVARCHAR(64)     NULL,
    UserAgent          NVARCHAR(256)    NULL,

    CONSTRAINT PK_Auth_RefreshTokens PRIMARY KEY CLUSTERED (TokenId),
    CONSTRAINT FK_Auth_RefreshTokens_Accounts FOREIGN KEY (UserId) REFERENCES dbo.Auth_Accounts(UserId),
    CONSTRAINT CK_Auth_RefreshTokens_ExpiresAfterIssued CHECK (ExpiresAt > IssuedAt),
    CONSTRAINT CK_Auth_RefreshTokens_RevokedAt CHECK (RevokedAt IS NULL OR RevokedAt >= IssuedAt)
);
GO

CREATE UNIQUE INDEX UX_Auth_RefreshTokens_TokenHash
    ON dbo.Auth_RefreshTokens(TokenHash);
GO

CREATE INDEX IX_Auth_RefreshTokens_UserId_ExpiresAt
    ON dbo.Auth_RefreshTokens(UserId, ExpiresAt DESC);
GO

CREATE INDEX IX_Auth_RefreshTokens_ExpiresAt
    ON dbo.Auth_RefreshTokens(ExpiresAt);
GO

/* ---------- Auth_LoginAuditLogs ---------- */
CREATE TABLE dbo.Auth_LoginAuditLogs
(
    Id            BIGINT IDENTITY(1,1) NOT NULL,
    UserId        UNIQUEIDENTIFIER     NULL,
    Email         NVARCHAR(256)        NOT NULL,
    Success       BIT                  NOT NULL,
    FailureReason NVARCHAR(200)        NULL,
    IpAddress     NVARCHAR(64)         NULL,
    UserAgent     NVARCHAR(256)        NULL,
    CreatedAt     DATETIME2(7)         NOT NULL CONSTRAINT DF_Auth_LoginAuditLogs_CreatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Auth_LoginAuditLogs PRIMARY KEY CLUSTERED (Id)
);
GO

CREATE INDEX IX_Auth_LoginAuditLogs_Email_CreatedAt
    ON dbo.Auth_LoginAuditLogs(Email, CreatedAt DESC);
GO

CREATE INDEX IX_Auth_LoginAuditLogs_UserId_CreatedAt
    ON dbo.Auth_LoginAuditLogs(UserId, CreatedAt DESC);
GO

/* ---------- Auth_OutboxEvents ---------- */
CREATE TABLE dbo.Auth_OutboxEvents
(
    EventId      UNIQUEIDENTIFIER NOT NULL,
    AggregateId  UNIQUEIDENTIFIER NOT NULL,
    EventType    NVARCHAR(100)    NOT NULL,
    PayloadJson  NVARCHAR(MAX)    NOT NULL,
    OccurredAt   DATETIME2(7)     NOT NULL CONSTRAINT DF_Auth_OutboxEvents_OccurredAt DEFAULT (SYSUTCDATETIME()),
    ProcessedAt  DATETIME2(7)     NULL,
    TraceId      NVARCHAR(100)    NULL,

    CONSTRAINT PK_Auth_OutboxEvents PRIMARY KEY CLUSTERED (EventId),
    CONSTRAINT CK_Auth_OutboxEvents_PayloadJson CHECK (ISJSON(PayloadJson) = 1)
);
GO

CREATE INDEX IX_Auth_OutboxEvents_ProcessedAt_OccurredAt
    ON dbo.Auth_OutboxEvents(ProcessedAt, OccurredAt);
GO


/* ---------- Seed default roles ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Auth_Roles WHERE Name = N'admin')
    INSERT INTO dbo.Auth_Roles(Name, Description) VALUES (N'admin', N'System administrator');
GO
IF NOT EXISTS (SELECT 1 FROM dbo.Auth_Roles WHERE Name = N'moderator')
    INSERT INTO dbo.Auth_Roles(Name, Description) VALUES (N'moderator', N'Content moderator');
GO
IF NOT EXISTS (SELECT 1 FROM dbo.Auth_Roles WHERE Name = N'user')
    INSERT INTO dbo.Auth_Roles(Name, Description) VALUES (N'user', N'Default user role');
GO


/* ---------- Seed admin account ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Auth_Accounts WHERE UserId = '99999999-9999-9999-9999-999999999999' OR Email = N'admin@it-social.local')
BEGIN
    INSERT INTO dbo.Auth_Accounts
    (
        UserId,
        Email,
        PasswordHash,
        PasswordAlgo,
        IsEmailVerified,
        Status,
        CreatedAt,
        UpdatedAt
    )
    VALUES
    (
        '99999999-9999-9999-9999-999999999999',
        N'admin@it-social.local',
        0xABEAA2F122982FDAE4B2F6B9E71F81C88A800856DF054021D9FB7205DD11D029037FB46443862694DAA5A3767F29E2BEEEDD5A7DA98337FD9221B4FC08ACE1CB,
        N'SHA2_512',
        1,
        1,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.Auth_UserRoles ur
    INNER JOIN dbo.Auth_Roles r ON r.RoleId = ur.RoleId
    WHERE ur.UserId = '99999999-9999-9999-9999-999999999999' AND r.Name = N'admin'
)
BEGIN
    INSERT INTO dbo.Auth_UserRoles(UserId, RoleId)
    SELECT '99999999-9999-9999-9999-999999999999', RoleId
    FROM dbo.Auth_Roles
    WHERE Name = N'admin';
END
GO

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.Auth_UserRoles ur
    INNER JOIN dbo.Auth_Roles r ON r.RoleId = ur.RoleId
    WHERE ur.UserId = '99999999-9999-9999-9999-999999999999' AND r.Name = N'user'
)
BEGIN
    INSERT INTO dbo.Auth_UserRoles(UserId, RoleId)
    SELECT '99999999-9999-9999-9999-999999999999', RoleId
    FROM dbo.Auth_Roles
    WHERE Name = N'user';
END
GO

/* Admin login:
   email: admin@it-social.local
   password: Admin@123
*/
