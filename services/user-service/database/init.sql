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
   Extended for profile / portfolio / CV / GitHub-style page
   ========================================================= */

/* ---------- Users ---------- */
CREATE TABLE dbo.Users
(
    UserId             UNIQUEIDENTIFIER NOT NULL,
    StudentCode        NVARCHAR(20)     NOT NULL,
    Username           NVARCHAR(50)     NOT NULL,
    FullName           NVARCHAR(120)    NOT NULL,
    TDMUEmail          NVARCHAR(256)    NULL,
    Department         NVARCHAR(100)    NULL,
    Major              NVARCHAR(100)    NULL,
    ClassName          NVARCHAR(50)     NULL,
    EnrollmentYear     SMALLINT         NULL,
    AvatarUrl          NVARCHAR(500)    NULL,
    CoverUrl           NVARCHAR(500)    NULL,
    Bio                NVARCHAR(500)    NULL,
    Headline           NVARCHAR(160)    NULL,
    Location           NVARCHAR(150)    NULL,
    WebsiteUrl         NVARCHAR(500)    NULL,
    GithubUrl          NVARCHAR(500)    NULL,
    LinkedInUrl        NVARCHAR(500)    NULL,
    PortfolioUrl       NVARCHAR(500)    NULL,
    PhoneNumber        NVARCHAR(30)     NULL,
    DateOfBirth        DATE             NULL,
    Gender             TINYINT          NULL,
    CurrentYear        TINYINT          NULL,
    GPA                DECIMAL(3,2)     NULL,
    CareerGoal         NVARCHAR(500)    NULL,
    OpenToInternship   BIT              NOT NULL CONSTRAINT DF_Users_OpenToInternship DEFAULT (0),
    OpenToJob          BIT              NOT NULL CONSTRAINT DF_Users_OpenToJob DEFAULT (0),
    OpenToCollab       BIT              NOT NULL CONSTRAINT DF_Users_OpenToCollab DEFAULT (1),
    PreferredJobTitle  NVARCHAR(120)    NULL,
    PreferredLocation  NVARCHAR(150)    NULL,
    ContributionScore  INT              NOT NULL CONSTRAINT DF_Users_ContributionScore DEFAULT (0),
    FollowersCount     INT              NOT NULL CONSTRAINT DF_Users_FollowersCount DEFAULT (0),
    FollowingCount     INT              NOT NULL CONSTRAINT DF_Users_FollowingCount DEFAULT (0),
    PublicRepoCount    INT              NOT NULL CONSTRAINT DF_Users_PublicRepoCount DEFAULT (0),
    PinnedProjectCount INT              NOT NULL CONSTRAINT DF_Users_PinnedProjectCount DEFAULT (0),
    ProfileCompletion  TINYINT          NOT NULL CONSTRAINT DF_Users_ProfileCompletion DEFAULT (0),
    LastProfileSyncAt  DATETIME2(7)     NULL,
    Status             TINYINT          NOT NULL CONSTRAINT DF_Users_Status DEFAULT (1),
    CreatedAt          DATETIME2(7)     NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt          DATETIME2(7)     NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT CK_Users_Status CHECK (Status IN (1, 2, 3)),
    CONSTRAINT CK_Users_EnrollmentYear CHECK (EnrollmentYear IS NULL OR (EnrollmentYear BETWEEN 2000 AND 2100)),
    CONSTRAINT CK_Users_Gender CHECK (Gender IS NULL OR Gender IN (1, 2, 3)),
    CONSTRAINT CK_Users_CurrentYear CHECK (CurrentYear IS NULL OR CurrentYear BETWEEN 1 AND 8),
    CONSTRAINT CK_Users_GPA CHECK (GPA IS NULL OR (GPA >= 0 AND GPA <= 4.00)),
    CONSTRAINT CK_Users_ProfileCompletion CHECK (ProfileCompletion BETWEEN 0 AND 100),
    CONSTRAINT CK_Users_FollowersCount CHECK (FollowersCount >= 0),
    CONSTRAINT CK_Users_FollowingCount CHECK (FollowingCount >= 0),
    CONSTRAINT CK_Users_PublicRepoCount CHECK (PublicRepoCount >= 0),
    CONSTRAINT CK_Users_PinnedProjectCount CHECK (PinnedProjectCount >= 0),
    CONSTRAINT CK_Users_ContributionScore CHECK (ContributionScore >= 0)
);
GO

CREATE UNIQUE INDEX UX_Users_StudentCode ON dbo.Users(StudentCode);
GO
CREATE UNIQUE INDEX UX_Users_Username ON dbo.Users(Username);
GO
CREATE UNIQUE INDEX UX_Users_TDMUEmail ON dbo.Users(TDMUEmail) WHERE TDMUEmail IS NOT NULL;
GO
CREATE INDEX IX_Users_Status ON dbo.Users(Status);
GO
CREATE INDEX IX_Users_OpenToJob_OpenToInternship ON dbo.Users(OpenToJob, OpenToInternship);
GO
CREATE INDEX IX_Users_Department_Major ON dbo.Users(Department, Major);
GO

/* ---------- UserSettings ---------- */
CREATE TABLE dbo.UserSettings
(
    UserId                  UNIQUEIDENTIFIER NOT NULL,
    PrivacyLevel            TINYINT          NOT NULL CONSTRAINT DF_UserSettings_PrivacyLevel DEFAULT (1),
    AllowDM                 BIT              NOT NULL CONSTRAINT DF_UserSettings_AllowDM DEFAULT (1),
    ShowEmail               BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowEmail DEFAULT (0),
    ShowPhoneNumber         BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowPhoneNumber DEFAULT (0),
    ShowDateOfBirth         BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowDateOfBirth DEFAULT (0),
    ShowEducation           BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowEducation DEFAULT (1),
    ShowExperience          BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowExperience DEFAULT (1),
    ShowCertificates        BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowCertificates DEFAULT (1),
    ShowProjects            BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowProjects DEFAULT (1),
    ShowContributionHeatmap BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowContributionHeatmap DEFAULT (1),
    ShowGitHubStyleProfile  BIT              NOT NULL CONSTRAINT DF_UserSettings_ShowGitHubStyleProfile DEFAULT (1),
    AllowCvDownload         BIT              NOT NULL CONSTRAINT DF_UserSettings_AllowCvDownload DEFAULT (1),
    IsCvPublic              BIT              NOT NULL CONSTRAINT DF_UserSettings_IsCvPublic DEFAULT (1),
    NotifyPrefsJson         NVARCHAR(MAX)    NULL,
    UpdatedAt               DATETIME2(7)     NOT NULL CONSTRAINT DF_UserSettings_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserSettings PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT FK_UserSettings_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserSettings_PrivacyLevel CHECK (PrivacyLevel IN (1, 2, 3, 4)),
    CONSTRAINT CK_UserSettings_NotifyPrefsJson CHECK (NotifyPrefsJson IS NULL OR ISJSON(NotifyPrefsJson) = 1)
);
GO

/* ---------- UserLinks ---------- */
CREATE TABLE dbo.UserLinks
(
    LinkId        UNIQUEIDENTIFIER NOT NULL,
    UserId        UNIQUEIDENTIFIER NOT NULL,
    Type          NVARCHAR(30)     NOT NULL,
    Title         NVARCHAR(100)    NULL,
    Url           NVARCHAR(500)    NOT NULL,
    DisplayOrder  INT              NOT NULL CONSTRAINT DF_UserLinks_DisplayOrder DEFAULT (0),
    IsVisible     BIT              NOT NULL CONSTRAINT DF_UserLinks_IsVisible DEFAULT (1),
    CreatedAt     DATETIME2(7)     NOT NULL CONSTRAINT DF_UserLinks_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt     DATETIME2(7)     NOT NULL CONSTRAINT DF_UserLinks_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserLinks PRIMARY KEY CLUSTERED (LinkId),
    CONSTRAINT FK_UserLinks_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserLinks_Type CHECK (Type IN ('github', 'linkedin', 'portfolio', 'facebook', 'website', 'resume', 'other')),
    CONSTRAINT CK_UserLinks_DisplayOrder CHECK (DisplayOrder >= 0)
);
GO

CREATE INDEX IX_UserLinks_UserId ON dbo.UserLinks(UserId);
GO

/* ---------- User Skills ---------- */
CREATE TABLE dbo.UserSkills
(
    SkillId          UNIQUEIDENTIFIER NOT NULL,
    UserId           UNIQUEIDENTIFIER NOT NULL,
    SkillName        NVARCHAR(100)    NOT NULL,
    Category         NVARCHAR(50)     NULL,
    ProficiencyLevel TINYINT          NULL,
    YearsOfExperience DECIMAL(4,1)    NULL,
    IsPrimary        BIT              NOT NULL CONSTRAINT DF_UserSkills_IsPrimary DEFAULT (0),
    DisplayOrder     INT              NOT NULL CONSTRAINT DF_UserSkills_DisplayOrder DEFAULT (0),
    CreatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_UserSkills_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt        DATETIME2(7)     NOT NULL CONSTRAINT DF_UserSkills_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserSkills PRIMARY KEY CLUSTERED (SkillId),
    CONSTRAINT FK_UserSkills_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserSkills_ProficiencyLevel CHECK (ProficiencyLevel IS NULL OR ProficiencyLevel BETWEEN 1 AND 5),
    CONSTRAINT CK_UserSkills_YearsOfExperience CHECK (YearsOfExperience IS NULL OR YearsOfExperience >= 0),
    CONSTRAINT CK_UserSkills_DisplayOrder CHECK (DisplayOrder >= 0)
);
GO

CREATE UNIQUE INDEX UX_UserSkills_UserId_SkillName ON dbo.UserSkills(UserId, SkillName);
GO
CREATE INDEX IX_UserSkills_UserId_Category ON dbo.UserSkills(UserId, Category);
GO

/* ---------- User Educations ---------- */
CREATE TABLE dbo.UserEducations
(
    EducationId     UNIQUEIDENTIFIER NOT NULL,
    UserId          UNIQUEIDENTIFIER NOT NULL,
    SchoolName      NVARCHAR(200)    NOT NULL,
    Degree          NVARCHAR(150)    NULL,
    Major           NVARCHAR(150)    NULL,
    StartDate       DATE             NULL,
    EndDate         DATE             NULL,
    IsCurrent       BIT              NOT NULL CONSTRAINT DF_UserEducations_IsCurrent DEFAULT (0),
    GPA             DECIMAL(3,2)     NULL,
    Description     NVARCHAR(1000)   NULL,
    DisplayOrder    INT              NOT NULL CONSTRAINT DF_UserEducations_DisplayOrder DEFAULT (0),
    CreatedAt       DATETIME2(7)     NOT NULL CONSTRAINT DF_UserEducations_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt       DATETIME2(7)     NOT NULL CONSTRAINT DF_UserEducations_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserEducations PRIMARY KEY CLUSTERED (EducationId),
    CONSTRAINT FK_UserEducations_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserEducations_GPA CHECK (GPA IS NULL OR (GPA >= 0 AND GPA <= 4.00)),
    CONSTRAINT CK_UserEducations_Dates CHECK (EndDate IS NULL OR StartDate IS NULL OR EndDate >= StartDate),
    CONSTRAINT CK_UserEducations_DisplayOrder CHECK (DisplayOrder >= 0)
);
GO

CREATE INDEX IX_UserEducations_UserId ON dbo.UserEducations(UserId);
GO

/* ---------- User Experiences ---------- */
CREATE TABLE dbo.UserExperiences
(
    ExperienceId      UNIQUEIDENTIFIER NOT NULL,
    UserId            UNIQUEIDENTIFIER NOT NULL,
    CompanyName       NVARCHAR(200)    NOT NULL,
    PositionTitle     NVARCHAR(150)    NOT NULL,
    EmploymentType    NVARCHAR(50)     NULL,
    Location          NVARCHAR(150)    NULL,
    IsRemote          BIT              NOT NULL CONSTRAINT DF_UserExperiences_IsRemote DEFAULT (0),
    StartDate         DATE             NULL,
    EndDate           DATE             NULL,
    IsCurrent         BIT              NOT NULL CONSTRAINT DF_UserExperiences_IsCurrent DEFAULT (0),
    Description       NVARCHAR(2000)   NULL,
    TechStack         NVARCHAR(1000)   NULL,
    AchievementSummary NVARCHAR(1000)  NULL,
    DisplayOrder      INT              NOT NULL CONSTRAINT DF_UserExperiences_DisplayOrder DEFAULT (0),
    CreatedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserExperiences_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserExperiences_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserExperiences PRIMARY KEY CLUSTERED (ExperienceId),
    CONSTRAINT FK_UserExperiences_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserExperiences_Dates CHECK (EndDate IS NULL OR StartDate IS NULL OR EndDate >= StartDate),
    CONSTRAINT CK_UserExperiences_DisplayOrder CHECK (DisplayOrder >= 0)
);
GO

CREATE INDEX IX_UserExperiences_UserId ON dbo.UserExperiences(UserId);
GO

/* ---------- User Certificates ---------- */
CREATE TABLE dbo.UserCertificates
(
    CertificateId     UNIQUEIDENTIFIER NOT NULL,
    UserId            UNIQUEIDENTIFIER NOT NULL,
    CertificateName   NVARCHAR(200)    NOT NULL,
    Issuer            NVARCHAR(200)    NULL,
    IssueDate         DATE             NULL,
    ExpirationDate    DATE             NULL,
    CredentialId      NVARCHAR(100)    NULL,
    CredentialUrl     NVARCHAR(500)    NULL,
    AttachmentUrl     NVARCHAR(500)    NULL,
    Description       NVARCHAR(1000)   NULL,
    DisplayOrder      INT              NOT NULL CONSTRAINT DF_UserCertificates_DisplayOrder DEFAULT (0),
    CreatedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserCertificates_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserCertificates_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserCertificates PRIMARY KEY CLUSTERED (CertificateId),
    CONSTRAINT FK_UserCertificates_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserCertificates_Dates CHECK (ExpirationDate IS NULL OR IssueDate IS NULL OR ExpirationDate >= IssueDate),
    CONSTRAINT CK_UserCertificates_DisplayOrder CHECK (DisplayOrder >= 0)
);
GO

CREATE INDEX IX_UserCertificates_UserId ON dbo.UserCertificates(UserId);
GO

/* ---------- User Projects / Portfolio ---------- */
CREATE TABLE dbo.UserProjects
(
    ProjectId             UNIQUEIDENTIFIER NOT NULL,
    UserId                UNIQUEIDENTIFIER NOT NULL,
    ProjectName           NVARCHAR(200)    NOT NULL,
    Slug                  NVARCHAR(200)    NULL,
    Summary               NVARCHAR(500)    NULL,
    Description           NVARCHAR(MAX)    NULL,
    RepositoryUrl         NVARCHAR(500)    NULL,
    DemoUrl               NVARCHAR(500)    NULL,
    ThumbnailUrl          NVARCHAR(500)    NULL,
    BannerUrl             NVARCHAR(500)    NULL,
    PrimaryLanguage       NVARCHAR(50)     NULL,
    TechStack             NVARCHAR(1000)   NULL,
    Visibility            TINYINT          NOT NULL CONSTRAINT DF_UserProjects_Visibility DEFAULT (1),
    IsPinned              BIT              NOT NULL CONSTRAINT DF_UserProjects_IsPinned DEFAULT (0),
    IsFeatured            BIT              NOT NULL CONSTRAINT DF_UserProjects_IsFeatured DEFAULT (0),
    IsAcademicProject     BIT              NOT NULL CONSTRAINT DF_UserProjects_IsAcademicProject DEFAULT (0),
    StarsCount            INT              NOT NULL CONSTRAINT DF_UserProjects_StarsCount DEFAULT (0),
    ForksCount            INT              NOT NULL CONSTRAINT DF_UserProjects_ForksCount DEFAULT (0),
    WatchersCount         INT              NOT NULL CONSTRAINT DF_UserProjects_WatchersCount DEFAULT (0),
    CommitCount           INT              NOT NULL CONSTRAINT DF_UserProjects_CommitCount DEFAULT (0),
    LastContributionAt    DATETIME2(7)     NULL,
    StartedAt             DATE             NULL,
    CompletedAt           DATE             NULL,
    DisplayOrder          INT              NOT NULL CONSTRAINT DF_UserProjects_DisplayOrder DEFAULT (0),
    CreatedAt             DATETIME2(7)     NOT NULL CONSTRAINT DF_UserProjects_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt             DATETIME2(7)     NOT NULL CONSTRAINT DF_UserProjects_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserProjects PRIMARY KEY CLUSTERED (ProjectId),
    CONSTRAINT FK_UserProjects_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserProjects_Visibility CHECK (Visibility IN (1, 2, 3)),
    CONSTRAINT CK_UserProjects_DisplayOrder CHECK (DisplayOrder >= 0),
    CONSTRAINT CK_UserProjects_Counts CHECK (StarsCount >= 0 AND ForksCount >= 0 AND WatchersCount >= 0 AND CommitCount >= 0),
    CONSTRAINT CK_UserProjects_Dates CHECK (CompletedAt IS NULL OR StartedAt IS NULL OR CompletedAt >= StartedAt)
);
GO

CREATE UNIQUE INDEX UX_UserProjects_UserId_Slug ON dbo.UserProjects(UserId, Slug) WHERE Slug IS NOT NULL;
GO
CREATE INDEX IX_UserProjects_UserId_IsPinned ON dbo.UserProjects(UserId, IsPinned, DisplayOrder);
GO
CREATE INDEX IX_UserProjects_UserId_Visibility ON dbo.UserProjects(UserId, Visibility);
GO

/* ---------- User Project Assets ---------- */
CREATE TABLE dbo.UserProjectAssets
(
    AssetId           UNIQUEIDENTIFIER NOT NULL,
    ProjectId         UNIQUEIDENTIFIER NOT NULL,
    AssetType         NVARCHAR(30)     NOT NULL,
    Title             NVARCHAR(150)    NULL,
    Url               NVARCHAR(500)    NOT NULL,
    MimeType          NVARCHAR(100)    NULL,
    DisplayOrder      INT              NOT NULL CONSTRAINT DF_UserProjectAssets_DisplayOrder DEFAULT (0),
    CreatedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserProjectAssets_CreatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserProjectAssets PRIMARY KEY CLUSTERED (AssetId),
    CONSTRAINT FK_UserProjectAssets_UserProjects FOREIGN KEY (ProjectId) REFERENCES dbo.UserProjects(ProjectId) ON DELETE CASCADE,
    CONSTRAINT CK_UserProjectAssets_AssetType CHECK (AssetType IN ('image', 'video', 'document', 'slide', 'demo', 'other')),
    CONSTRAINT CK_UserProjectAssets_DisplayOrder CHECK (DisplayOrder >= 0)
);
GO

CREATE INDEX IX_UserProjectAssets_ProjectId ON dbo.UserProjectAssets(ProjectId);
GO

/* ---------- User Contributions ---------- */
CREATE TABLE dbo.UserContributions
(
    ContributionId    UNIQUEIDENTIFIER NOT NULL,
    UserId            UNIQUEIDENTIFIER NOT NULL,
    SourceType        NVARCHAR(30)     NOT NULL,
    SourceId          NVARCHAR(100)    NOT NULL,
    SourceTitle       NVARCHAR(200)    NULL,
    ContributionDate  DATE             NOT NULL,
    ContributionCount INT              NOT NULL CONSTRAINT DF_UserContributions_ContributionCount DEFAULT (1),
    MetadataJson      NVARCHAR(MAX)    NULL,
    CreatedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserContributions_CreatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserContributions PRIMARY KEY CLUSTERED (ContributionId),
    CONSTRAINT FK_UserContributions_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserContributions_SourceType CHECK (SourceType IN ('commit', 'repository', 'post', 'problem', 'quiz', 'certificate', 'project', 'other')),
    CONSTRAINT CK_UserContributions_Count CHECK (ContributionCount > 0),
    CONSTRAINT CK_UserContributions_MetadataJson CHECK (MetadataJson IS NULL OR ISJSON(MetadataJson) = 1)
);
GO

CREATE INDEX IX_UserContributions_UserId_Date ON dbo.UserContributions(UserId, ContributionDate DESC);
GO
CREATE UNIQUE INDEX UX_UserContributions_Source ON dbo.UserContributions(UserId, SourceType, SourceId, ContributionDate);
GO

/* ---------- User CVs ---------- */
CREATE TABLE dbo.UserCVs
(
    CvId               UNIQUEIDENTIFIER NOT NULL,
    UserId             UNIQUEIDENTIFIER NOT NULL,
    CvTitle            NVARCHAR(150)    NOT NULL,
    FileName           NVARCHAR(260)    NOT NULL,
    FileUrl            NVARCHAR(500)    NOT NULL,
    FileExt            NVARCHAR(10)     NULL,
    FileSizeBytes      BIGINT           NULL,
    MimeType           NVARCHAR(100)    NULL,
    VersionNo          INT              NOT NULL CONSTRAINT DF_UserCVs_VersionNo DEFAULT (1),
    IsPrimary          BIT              NOT NULL CONSTRAINT DF_UserCVs_IsPrimary DEFAULT (0),
    IsPublic           BIT              NOT NULL CONSTRAINT DF_UserCVs_IsPublic DEFAULT (1),
    Summary            NVARCHAR(500)    NULL,
    UploadedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserCVs_UploadedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt          DATETIME2(7)     NOT NULL CONSTRAINT DF_UserCVs_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserCVs PRIMARY KEY CLUSTERED (CvId),
    CONSTRAINT FK_UserCVs_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserCVs_VersionNo CHECK (VersionNo > 0),
    CONSTRAINT CK_UserCVs_FileSizeBytes CHECK (FileSizeBytes IS NULL OR FileSizeBytes >= 0)
);
GO

CREATE INDEX IX_UserCVs_UserId_UpdatedAt ON dbo.UserCVs(UserId, UpdatedAt DESC);
GO
CREATE UNIQUE INDEX UX_UserCVs_PrimaryPerUser ON dbo.UserCVs(UserId, IsPrimary) WHERE IsPrimary = 1;
GO

/* ---------- User Highlights ---------- */
CREATE TABLE dbo.UserHighlights
(
    HighlightId       UNIQUEIDENTIFIER NOT NULL,
    UserId            UNIQUEIDENTIFIER NOT NULL,
    HighlightType     NVARCHAR(30)     NOT NULL,
    Title             NVARCHAR(200)    NOT NULL,
    Description       NVARCHAR(1000)   NULL,
    RefUrl            NVARCHAR(500)    NULL,
    RefId             NVARCHAR(100)    NULL,
    DisplayOrder      INT              NOT NULL CONSTRAINT DF_UserHighlights_DisplayOrder DEFAULT (0),
    IsVisible         BIT              NOT NULL CONSTRAINT DF_UserHighlights_IsVisible DEFAULT (1),
    CreatedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserHighlights_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt         DATETIME2(7)     NOT NULL CONSTRAINT DF_UserHighlights_UpdatedAt DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT PK_UserHighlights PRIMARY KEY CLUSTERED (HighlightId),
    CONSTRAINT FK_UserHighlights_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_UserHighlights_HighlightType CHECK (HighlightType IN ('achievement', 'project', 'certificate', 'repository', 'post', 'cv', 'other')),
    CONSTRAINT CK_UserHighlights_DisplayOrder CHECK (DisplayOrder >= 0)
);
GO

CREATE INDEX IX_UserHighlights_UserId_DisplayOrder ON dbo.UserHighlights(UserId, DisplayOrder);
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

/* ---------- Helpful View: public profile summary ---------- */
CREATE VIEW dbo.vw_UserPublicProfileSummary
AS
SELECT
    u.UserId,
    u.StudentCode,
    u.Username,
    u.FullName,
    u.TDMUEmail,
    u.Department,
    u.Major,
    u.ClassName,
    u.EnrollmentYear,
    u.AvatarUrl,
    u.CoverUrl,
    u.Bio,
    u.Headline,
    u.Location,
    u.WebsiteUrl,
    u.GithubUrl,
    u.LinkedInUrl,
    u.PortfolioUrl,
    u.OpenToInternship,
    u.OpenToJob,
    u.OpenToCollab,
    u.PreferredJobTitle,
    u.PreferredLocation,
    u.ContributionScore,
    u.FollowersCount,
    u.FollowingCount,
    u.PublicRepoCount,
    u.PinnedProjectCount,
    u.ProfileCompletion,
    u.Status,
    u.CreatedAt,
    u.UpdatedAt
FROM dbo.Users AS u
WHERE u.Status = 1;
GO
