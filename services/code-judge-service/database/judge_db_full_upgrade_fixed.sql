SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/*
  JudgeDB full upgrade script (rewritten)
  - SQL Server / Azure SQL compatible
  - Safe to run multiple times where possible
  - Keeps and upgrades core judge tables
  - Adds support for code labs, file/report submission, quiz, microlearning, gamification
  - Adds path-to-path unlock logic for Duolingo-style learning paths
*/

IF DB_ID(N'JudgeDB') IS NULL
BEGIN
    CREATE DATABASE JudgeDB;
END
GO

USE JudgeDB;
GO

/* =========================================================
   0) CORE REFERENCE TABLES
   ========================================================= */

IF OBJECT_ID(N'dbo.Judge_Languages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Languages
    (
        LanguageId          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Name                NVARCHAR(100) NOT NULL,
        Compiler            NVARCHAR(100) NULL,
        Version             NVARCHAR(50) NULL,
        IsEnabled           BIT NOT NULL CONSTRAINT DF_Judge_Languages_IsEnabled DEFAULT(1),
        MonacoKey           NVARCHAR(50) NULL,
        FileExtension       NVARCHAR(20) NULL,
        CompileCommand      NVARCHAR(500) NULL,
        RunCommand          NVARCHAR(500) NULL,
        TemplateCode        NVARCHAR(MAX) NULL,
        SortOrder           INT NOT NULL CONSTRAINT DF_Judge_Languages_SortOrder DEFAULT(0),
        CreatedAt           DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Languages_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_Languages_Name UNIQUE (Name)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_Topics', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Topics
    (
        TopicId             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        ParentTopicId       UNIQUEIDENTIFIER NULL,
        Code                NVARCHAR(100) NOT NULL,
        Name                NVARCHAR(200) NOT NULL,
        Slug                NVARCHAR(200) NOT NULL,
        Description         NVARCHAR(MAX) NULL,
        Icon                NVARCHAR(100) NULL,
        ColorHex            NVARCHAR(20) NULL,
        SortOrder           INT NOT NULL CONSTRAINT DF_Judge_Topics_SortOrder DEFAULT(0),
        IsActive            BIT NOT NULL CONSTRAINT DF_Judge_Topics_IsActive DEFAULT(1),
        CreatedAt           DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Topics_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_Topics_Code UNIQUE (Code),
        CONSTRAINT UQ_Judge_Topics_Slug UNIQUE (Slug)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_SkillTags', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_SkillTags
    (
        SkillTagId          UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        TopicId             UNIQUEIDENTIFIER NULL,
        Code                NVARCHAR(100) NOT NULL,
        Name                NVARCHAR(200) NOT NULL,
        Slug                NVARCHAR(200) NOT NULL,
        Description         NVARCHAR(MAX) NULL,
        DifficultyWeight    DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_SkillTags_DifficultyWeight DEFAULT(1.00),
        SortOrder           INT NOT NULL CONSTRAINT DF_Judge_SkillTags_SortOrder DEFAULT(0),
        IsActive            BIT NOT NULL CONSTRAINT DF_Judge_SkillTags_IsActive DEFAULT(1),
        CreatedAt           DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_SkillTags_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt           DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_SkillTags_Code UNIQUE (Code),
        CONSTRAINT UQ_Judge_SkillTags_Slug UNIQUE (Slug)
    );
END
GO

/* =========================================================
   1) CORE JUDGE TABLES
   ========================================================= */

IF OBJECT_ID(N'dbo.Judge_Problems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Problems
    (
        ProblemId               UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        Title                   NVARCHAR(300) NOT NULL,
        Slug                    NVARCHAR(300) NOT NULL,
        Difficulty              TINYINT NOT NULL,
        TimeLimitMs             INT NOT NULL,
        MemoryLimitMB           INT NOT NULL,
        Statement               NVARCHAR(MAX) NOT NULL,
        CreatedByUserId         UNIQUEIDENTIFIER NOT NULL,
        IsPublic                BIT NOT NULL CONSTRAINT DF_Judge_Problems_IsPublic DEFAULT(0),
        Status                  TINYINT NOT NULL CONSTRAINT DF_Judge_Problems_Status DEFAULT(1),
        CreatedAt               DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Problems_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt               DATETIME2(0) NULL,

        ProblemType             NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_Problems_ProblemType DEFAULT(N'code'),
        SubmissionMode          NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_Problems_SubmissionMode DEFAULT(N'code'),
        DifficultyLevel         TINYINT NULL,
        PrimaryTopicId          UNIQUEIDENTIFIER NULL,
        Topic                   NVARCHAR(200) NULL,
        SkillTag                NVARCHAR(500) NULL,
        EstimatedMinutes        SMALLINT NULL,
        PointsReward            INT NULL,
        MaxScore                INT NOT NULL CONSTRAINT DF_Judge_Problems_MaxScore DEFAULT(100),
        PassPercentage          DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_Problems_PassPercentage DEFAULT(100.00),
        InputFormat             NVARCHAR(MAX) NULL,
        OutputFormat            NVARCHAR(MAX) NULL,
        ConstraintsText         NVARCHAR(MAX) NULL,
        Notes                   NVARCHAR(MAX) NULL,
        HintText                NVARCHAR(MAX) NULL,
        StarterCode             NVARCHAR(MAX) NULL,
        StarterCodeByLanguage   NVARCHAR(MAX) NULL,
        ReferenceSolution       NVARCHAR(MAX) NULL,
        EditorialText           NVARCHAR(MAX) NULL,
        CheckerType             NVARCHAR(50) NOT NULL CONSTRAINT DF_Judge_Problems_CheckerType DEFAULT(N'exact'),
        CheckerSourceCode       NVARCHAR(MAX) NULL,
        AllowCustomInput        BIT NOT NULL CONSTRAINT DF_Judge_Problems_AllowCustomInput DEFAULT(1),
        AllowPartialScoring     BIT NOT NULL CONSTRAINT DF_Judge_Problems_AllowPartialScoring DEFAULT(0),
        AllowAttachmentUpload   BIT NOT NULL CONSTRAINT DF_Judge_Problems_AllowAttachmentUpload DEFAULT(0),
        RequireReportFile       BIT NOT NULL CONSTRAINT DF_Judge_Problems_RequireReportFile DEFAULT(0),
        AttachmentRules         NVARCHAR(MAX) NULL,
        VisibleFrom             DATETIME2(0) NULL,
        DueAt                   DATETIME2(0) NULL,
        MaxAttempts             INT NULL,
        SourceType              NVARCHAR(50) NULL,
        CourseCode              NVARCHAR(50) NULL,
        SemesterCode            NVARCHAR(30) NULL,
        ChapterNo               INT NULL,
        LessonNo                INT NULL,
        IsFeatured              BIT NOT NULL CONSTRAINT DF_Judge_Problems_IsFeatured DEFAULT(0),
        SortOrder               INT NOT NULL CONSTRAINT DF_Judge_Problems_SortOrder DEFAULT(0),
        SupportedLanguagesJson  NVARCHAR(MAX) NULL,
        MetadataJson            NVARCHAR(MAX) NULL,
        RubricJson              NVARCHAR(MAX) NULL,
        CONSTRAINT UQ_Judge_Problems_Slug UNIQUE (Slug)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_ProblemAllowedLanguages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_ProblemAllowedLanguages
    (
        ProblemLanguageId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        ProblemId               UNIQUEIDENTIFIER NOT NULL,
        LanguageId              INT NOT NULL,
        IsDefault               BIT NOT NULL CONSTRAINT DF_Judge_ProblemAllowedLanguages_IsDefault DEFAULT(0),
        StarterCode             NVARCHAR(MAX) NULL,
        TemplateCode            NVARCHAR(MAX) NULL,
        SortOrder               INT NOT NULL CONSTRAINT DF_Judge_ProblemAllowedLanguages_SortOrder DEFAULT(0),
        CreatedAt               DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_ProblemAllowedLanguages_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Judge_ProblemAllowedLanguages UNIQUE (ProblemId, LanguageId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_ProblemSkillTags', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_ProblemSkillTags
    (
        ProblemSkillTagId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        ProblemId               UNIQUEIDENTIFIER NOT NULL,
        SkillTagId              UNIQUEIDENTIFIER NOT NULL,
        Weight                  DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_ProblemSkillTags_Weight DEFAULT(1.00),
        CreatedAt               DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_ProblemSkillTags_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Judge_ProblemSkillTags UNIQUE (ProblemId, SkillTagId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_ProblemResources', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_ProblemResources
    (
        ResourceId              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        ProblemId               UNIQUEIDENTIFIER NOT NULL,
        ResourceType            NVARCHAR(30) NOT NULL,
        Title                   NVARCHAR(300) NOT NULL,
        FileName                NVARCHAR(255) NULL,
        FileUrl                 NVARCHAR(1000) NULL,
        FileMimeType            NVARCHAR(150) NULL,
        FileSizeBytes           BIGINT NULL,
        StorageProvider         NVARCHAR(50) NULL,
        Description             NVARCHAR(MAX) NULL,
        IsRequired              BIT NOT NULL CONSTRAINT DF_Judge_ProblemResources_IsRequired DEFAULT(0),
        SortOrder               INT NOT NULL CONSTRAINT DF_Judge_ProblemResources_SortOrder DEFAULT(0),
        CreatedAt               DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_ProblemResources_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_TestCases', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_TestCases
    (
        TestCaseId              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        ProblemId               UNIQUEIDENTIFIER NOT NULL,
        InputData               VARBINARY(MAX) NULL,
        OutputData              VARBINARY(MAX) NULL,
        IsSample                BIT NOT NULL CONSTRAINT DF_Judge_TestCases_IsSample DEFAULT(0),
        Score                   DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_TestCases_Score DEFAULT(0),
        OrderNo                 INT NOT NULL,
        Name                    NVARCHAR(200) NULL,
        Description             NVARCHAR(MAX) NULL,
        CaseGroup               NVARCHAR(100) NULL,
        Weight                  DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_TestCases_Weight DEFAULT(1),
        IsHidden                BIT NOT NULL CONSTRAINT DF_Judge_TestCases_IsHidden DEFAULT(1),
        InputText               NVARCHAR(MAX) NULL,
        ExpectedOutputText      NVARCHAR(MAX) NULL,
        InputFileName           NVARCHAR(255) NULL,
        OutputFileName          NVARCHAR(255) NULL,
        MaxTimeMs               INT NULL,
        MaxMemoryKB             INT NULL,
        CheckerConfigJson       NVARCHAR(MAX) NULL,
        Notes                   NVARCHAR(MAX) NULL,
        CreatedAt               DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_TestCases_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt               DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_TestCases_Problem_OrderNo UNIQUE (ProblemId, OrderNo)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_Submissions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Submissions
    (
        SubmissionId            UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        ProblemId               UNIQUEIDENTIFIER NOT NULL,
        UserId                  UNIQUEIDENTIFIER NOT NULL,
        LanguageId              INT NOT NULL,
        SourceCode              NVARCHAR(MAX) NOT NULL,
        CodeHash                BINARY(32) NULL,
        SubmittedAt             DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Submissions_SubmittedAt DEFAULT SYSUTCDATETIME(),
        Status                  TINYINT NOT NULL,
        TotalTimeMs             INT NULL,
        TotalMemoryKB           INT NULL,
        Score                   DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_Submissions_Score DEFAULT(0),
        CompilerMessage         NVARCHAR(MAX) NULL,

        AttemptNo               INT NULL,
        SubmissionType          NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_Submissions_SubmissionType DEFAULT(N'normal'),
        IsPractice              BIT NOT NULL CONSTRAINT DF_Judge_Submissions_IsPractice DEFAULT(1),
        MaxScore                DECIMAL(10,2) NULL,
        PassedTestCount         INT NULL,
        FailedTestCount         INT NULL,
        TotalTestCount          INT NULL,
        PassRate                DECIMAL(5,2) NULL,
        EarnedXp                INT NULL,
        SubmittedIp             NVARCHAR(64) NULL,
        UserAgent               NVARCHAR(500) NULL,
        QueueToken              NVARCHAR(200) NULL,
        StartedAt               DATETIME2(0) NULL,
        JudgedAt                DATETIME2(0) NULL,
        IsFinal                 BIT NOT NULL CONSTRAINT DF_Judge_Submissions_IsFinal DEFAULT(1),
        Visibility              NVARCHAR(20) NOT NULL CONSTRAINT DF_Judge_Submissions_Visibility DEFAULT(N'private'),
        MetadataJson            NVARCHAR(MAX) NULL,
        ReportFileUrl           NVARCHAR(1000) NULL,
        ReportFileName          NVARCHAR(255) NULL,
        AttachmentJson          NVARCHAR(MAX) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_SubmissionFiles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_SubmissionFiles
    (
        SubmissionFileId        UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        SubmissionId            UNIQUEIDENTIFIER NOT NULL,
        FileType                NVARCHAR(30) NOT NULL,
        FileName                NVARCHAR(255) NOT NULL,
        FileUrl                 NVARCHAR(1000) NULL,
        FileMimeType            NVARCHAR(150) NULL,
        FileSizeBytes           BIGINT NULL,
        StorageProvider         NVARCHAR(50) NULL,
        Checksum                NVARCHAR(128) NULL,
        SortOrder               INT NOT NULL CONSTRAINT DF_Judge_SubmissionFiles_SortOrder DEFAULT(0),
        CreatedAt               DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_SubmissionFiles_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_SubmissionTestResults', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_SubmissionTestResults
    (
        SubmissionTestResultId  UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        SubmissionId            UNIQUEIDENTIFIER NOT NULL,
        TestCaseId              UNIQUEIDENTIFIER NOT NULL,
        Status                  TINYINT NOT NULL,
        TimeMs                  INT NULL,
        MemoryKB                INT NULL,
        ErrorMessage            NVARCHAR(MAX) NULL,
        CreatedAt               DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_SubmissionTestResults_CreatedAt DEFAULT SYSUTCDATETIME(),
        ActualOutput            NVARCHAR(MAX) NULL,
        ExpectedOutput          NVARCHAR(MAX) NULL,
        ScoreEarned             DECIMAL(10,2) NULL,
        DiffText                NVARCHAR(MAX) NULL,
        CheckerNote             NVARCHAR(MAX) NULL,
        IsSampleCase            BIT NULL,
        CaseOrderNo             INT NULL,
        ExecutionToken          NVARCHAR(100) NULL,
        CONSTRAINT UQ_Judge_SubmissionTestResults UNIQUE (SubmissionId, TestCaseId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_Results', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Results
    (
        ResultId                 UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        SubmissionId             UNIQUEIDENTIFIER NOT NULL,
        Verdict                  TINYINT NOT NULL,
        Score                    DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_Results_Score DEFAULT(0),
        PassedTestCount          INT NULL,
        FailedTestCount          INT NULL,
        TotalTestCount           INT NULL,
        TotalTimeMs              INT NULL,
        TotalMemoryKB            INT NULL,
        CompilerMessage          NVARCHAR(MAX) NULL,
        RuntimeMessage           NVARCHAR(MAX) NULL,
        PayloadJson              NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Results_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Judge_Results_SubmissionId UNIQUE (SubmissionId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_ExecutionLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_ExecutionLogs
    (
        ExecutionLogId           UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        SubmissionId             UNIQUEIDENTIFIER NULL,
        ProblemId                UNIQUEIDENTIFIER NULL,
        UserId                   UNIQUEIDENTIFIER NULL,
        LanguageId               INT NULL,
        Provider                 NVARCHAR(50) NULL,
        ActionType               NVARCHAR(50) NOT NULL,
        RequestPayloadJson       NVARCHAR(MAX) NULL,
        ResponsePayloadJson      NVARCHAR(MAX) NULL,
        StatusCode               INT NULL,
        IsSuccess                BIT NOT NULL CONSTRAINT DF_Judge_ExecutionLogs_IsSuccess DEFAULT(0),
        DurationMs               INT NULL,
        CorrelationId            NVARCHAR(100) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_ExecutionLogs_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_UserProblemStats', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserProblemStats
    (
        UserProblemStatId        UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        ProblemId                UNIQUEIDENTIFIER NOT NULL,
        BestStatus               TINYINT NULL,
        BestTimeMs               INT NULL,
        BestMemoryKB             INT NULL,
        Attempts                 INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_Attempts DEFAULT(0),
        LastSubmittedAt          DATETIME2(0) NULL,
        FirstAcceptedAt          DATETIME2(0) NULL,
        BestScore                DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_UserProblemStats_BestScore DEFAULT(0),
        AcceptedCount            INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_AcceptedCount DEFAULT(0),
        PartialCount             INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_PartialCount DEFAULT(0),
        WrongAnswerCount         INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_WrongAnswerCount DEFAULT(0),
        RuntimeErrorCount        INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_RuntimeErrorCount DEFAULT(0),
        CompilationErrorCount    INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_CompilationErrorCount DEFAULT(0),
        LastLanguageId           INT NULL,
        LastScore                DECIMAL(10,2) NULL,
        CompletionPercent        DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_UserProblemStats_CompletionPercent DEFAULT(0),
        TotalTimeSpentMinutes    INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_TotalTimeSpentMinutes DEFAULT(0),
        IsBookmarked             BIT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_IsBookmarked DEFAULT(0),
        IsFavorite               BIT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_IsFavorite DEFAULT(0),
        LastViewedAt             DATETIME2(0) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserProblemStats_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_UserProblemStats UNIQUE (UserId, ProblemId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_OutboxEvents', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_OutboxEvents
    (
        EventId                  UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        AggregateId              UNIQUEIDENTIFIER NOT NULL,
        EventType                NVARCHAR(200) NOT NULL,
        PayloadJson              NVARCHAR(MAX) NOT NULL,
        OccurredAt               DATETIME2(0) NOT NULL,
        ProcessedAt              DATETIME2(0) NULL,
        TraceId                  NVARCHAR(100) NULL,
        RetryCount               INT NOT NULL CONSTRAINT DF_Judge_OutboxEvents_RetryCount DEFAULT(0),
        ErrorMessage             NVARCHAR(MAX) NULL,
        LockedUntil              DATETIME2(0) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_OutboxEvents_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Judge_OutboxEvents_TraceId UNIQUE (TraceId)
    );
END
GO

/* =========================================================
   2) LEARNING / QUIZ / GAMIFICATION TABLES
   ========================================================= */

IF OBJECT_ID(N'dbo.Judge_LearningPaths', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_LearningPaths
    (
        PathId                   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        Title                    NVARCHAR(300) NOT NULL,
        Slug                     NVARCHAR(300) NOT NULL,
        Description              NVARCHAR(MAX) NULL,
        LevelFrom                TINYINT NULL,
        LevelTo                  TINYINT NULL,
        EstimatedMinutes         INT NULL,
        TotalXpReward            INT NOT NULL CONSTRAINT DF_Judge_LearningPaths_TotalXpReward DEFAULT(0),
        CoverImageUrl            NVARCHAR(1000) NULL,
        Icon                     NVARCHAR(100) NULL,
        ColorHex                 NVARCHAR(20) NULL,
        UnlockRule               NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_LearningPaths_UnlockRule DEFAULT(N'prerequisite'),
        MinimumXpRequired        INT NOT NULL CONSTRAINT DF_Judge_LearningPaths_MinimumXpRequired DEFAULT(0),
        MinimumCompletionPercent DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_LearningPaths_MinimumCompletionPercent DEFAULT(100.00),
        Status                   TINYINT NOT NULL CONSTRAINT DF_Judge_LearningPaths_Status DEFAULT(1),
        IsPublic                 BIT NOT NULL CONSTRAINT DF_Judge_LearningPaths_IsPublic DEFAULT(1),
        SortOrder                INT NOT NULL CONSTRAINT DF_Judge_LearningPaths_SortOrder DEFAULT(0),
        CreatedByUserId          UNIQUEIDENTIFIER NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_LearningPaths_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_LearningPaths_Slug UNIQUE (Slug)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_PathPrerequisites', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_PathPrerequisites
    (
        PathPrerequisiteId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        PathId                   UNIQUEIDENTIFIER NOT NULL,
        RequiredPathId           UNIQUEIDENTIFIER NOT NULL,
        RequirementType          NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_PathPrerequisites_RequirementType DEFAULT(N'complete_path'),
        MinCompletionPercent     DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_PathPrerequisites_MinCompletionPercent DEFAULT(100.00),
        SortOrder                INT NOT NULL CONSTRAINT DF_Judge_PathPrerequisites_SortOrder DEFAULT(0),
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_PathPrerequisites_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Judge_PathPrerequisites UNIQUE (PathId, RequiredPathId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_Lessons', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Lessons
    (
        LessonId                 UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        PathId                   UNIQUEIDENTIFIER NOT NULL,
        TopicId                  UNIQUEIDENTIFIER NULL,
        Title                    NVARCHAR(300) NOT NULL,
        Slug                     NVARCHAR(300) NOT NULL,
        Summary                  NVARCHAR(MAX) NULL,
        ContentMarkdown          NVARCHAR(MAX) NULL,
        LessonType               NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_Lessons_LessonType DEFAULT(N'mixed'),
        DifficultyLevel          TINYINT NULL,
        EstimatedMinutes         INT NULL,
        PointsReward             INT NOT NULL CONSTRAINT DF_Judge_Lessons_PointsReward DEFAULT(0),
        XpReward                 INT NOT NULL CONSTRAINT DF_Judge_Lessons_XpReward DEFAULT(0),
        SortOrder                INT NOT NULL,
        IsPublished              BIT NOT NULL CONSTRAINT DF_Judge_Lessons_IsPublished DEFAULT(0),
        VisibleFrom              DATETIME2(0) NULL,
        MetadataJson             NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Lessons_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_Lessons_Path_Slug UNIQUE (PathId, Slug)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_LessonItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_LessonItems
    (
        LessonItemId             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        LessonId                 UNIQUEIDENTIFIER NOT NULL,
        ItemType                 NVARCHAR(30) NOT NULL,
        RefId                    UNIQUEIDENTIFIER NULL,
        Title                    NVARCHAR(300) NULL,
        ContentMarkdown          NVARCHAR(MAX) NULL,
        EstimatedMinutes         INT NULL,
        IsRequired               BIT NOT NULL CONSTRAINT DF_Judge_LessonItems_IsRequired DEFAULT(1),
        UnlockAfterLessonItemId  UNIQUEIDENTIFIER NULL,
        SortOrder                INT NOT NULL,
        MetadataJson             NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_LessonItems_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_LessonProblemMap', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_LessonProblemMap
    (
        LessonProblemMapId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        LessonId                 UNIQUEIDENTIFIER NOT NULL,
        ProblemId                UNIQUEIDENTIFIER NOT NULL,
        SortOrder                INT NOT NULL CONSTRAINT DF_Judge_LessonProblemMap_SortOrder DEFAULT(0),
        IsRequired               BIT NOT NULL CONSTRAINT DF_Judge_LessonProblemMap_IsRequired DEFAULT(1),
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_LessonProblemMap_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Judge_LessonProblemMap UNIQUE (LessonId, ProblemId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_Quizzes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Quizzes
    (
        QuizId                   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        LessonId                 UNIQUEIDENTIFIER NULL,
        PathId                   UNIQUEIDENTIFIER NULL,
        Title                    NVARCHAR(300) NOT NULL,
        Description              NVARCHAR(MAX) NULL,
        QuizType                 NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_Quizzes_QuizType DEFAULT(N'mcq'),
        DifficultyLevel          TINYINT NULL,
        TimeLimitSeconds         INT NULL,
        PassingScore             DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_Quizzes_PassingScore DEFAULT(70),
        MaxAttempts              INT NULL,
        ShuffleQuestions         BIT NOT NULL CONSTRAINT DF_Judge_Quizzes_ShuffleQuestions DEFAULT(0),
        ShuffleChoices           BIT NOT NULL CONSTRAINT DF_Judge_Quizzes_ShuffleChoices DEFAULT(0),
        IsPublished              BIT NOT NULL CONSTRAINT DF_Judge_Quizzes_IsPublished DEFAULT(0),
        EstimatedMinutes         INT NULL,
        PointsReward             INT NOT NULL CONSTRAINT DF_Judge_Quizzes_PointsReward DEFAULT(0),
        XpReward                 INT NOT NULL CONSTRAINT DF_Judge_Quizzes_XpReward DEFAULT(0),
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Quizzes_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_LessonQuizMap', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_LessonQuizMap
    (
        LessonQuizMapId          UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        LessonId                 UNIQUEIDENTIFIER NOT NULL,
        QuizId                   UNIQUEIDENTIFIER NOT NULL,
        SortOrder                INT NOT NULL CONSTRAINT DF_Judge_LessonQuizMap_SortOrder DEFAULT(0),
        IsRequired               BIT NOT NULL CONSTRAINT DF_Judge_LessonQuizMap_IsRequired DEFAULT(1),
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_LessonQuizMap_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Judge_LessonQuizMap UNIQUE (LessonId, QuizId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_QuizQuestions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_QuizQuestions
    (
        QuestionId               UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        QuizId                   UNIQUEIDENTIFIER NOT NULL,
        TopicId                  UNIQUEIDENTIFIER NULL,
        SkillTagId               UNIQUEIDENTIFIER NULL,
        QuestionType             NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_QuizQuestions_QuestionType DEFAULT(N'single_choice'),
        Prompt                   NVARCHAR(MAX) NOT NULL,
        Explanation              NVARCHAR(MAX) NULL,
        DifficultyLevel          TINYINT NULL,
        Points                   DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_QuizQuestions_Points DEFAULT(1),
        NegativePoints           DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_QuizQuestions_NegativePoints DEFAULT(0),
        SortOrder                INT NOT NULL,
        IsActive                 BIT NOT NULL CONSTRAINT DF_Judge_QuizQuestions_IsActive DEFAULT(1),
        MetadataJson             NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_QuizQuestions_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_QuizChoices', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_QuizChoices
    (
        ChoiceId                 UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        QuestionId               UNIQUEIDENTIFIER NOT NULL,
        ChoiceText               NVARCHAR(MAX) NOT NULL,
        ChoiceValue              NVARCHAR(200) NULL,
        IsCorrect                BIT NOT NULL CONSTRAINT DF_Judge_QuizChoices_IsCorrect DEFAULT(0),
        FeedbackText             NVARCHAR(MAX) NULL,
        SortOrder                INT NOT NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_QuizChoices_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_QuizAttempts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_QuizAttempts
    (
        QuizAttemptId            UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        QuizId                   UNIQUEIDENTIFIER NOT NULL,
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        AttemptNo                INT NOT NULL CONSTRAINT DF_Judge_QuizAttempts_AttemptNo DEFAULT(1),
        Status                   NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_QuizAttempts_Status DEFAULT(N'in_progress'),
        StartedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_QuizAttempts_StartedAt DEFAULT SYSUTCDATETIME(),
        SubmittedAt              DATETIME2(0) NULL,
        TimeSpentSeconds         INT NULL,
        CorrectCount             INT NOT NULL CONSTRAINT DF_Judge_QuizAttempts_CorrectCount DEFAULT(0),
        WrongCount               INT NOT NULL CONSTRAINT DF_Judge_QuizAttempts_WrongCount DEFAULT(0),
        UnansweredCount          INT NOT NULL CONSTRAINT DF_Judge_QuizAttempts_UnansweredCount DEFAULT(0),
        Score                    DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_QuizAttempts_Score DEFAULT(0),
        Percentage               DECIMAL(5,2) NULL,
        IsPassed                 BIT NOT NULL CONSTRAINT DF_Judge_QuizAttempts_IsPassed DEFAULT(0),
        EarnedXp                 INT NOT NULL CONSTRAINT DF_Judge_QuizAttempts_EarnedXp DEFAULT(0),
        MetadataJson             NVARCHAR(MAX) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_QuizAnswers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_QuizAnswers
    (
        QuizAnswerId             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        QuizAttemptId            UNIQUEIDENTIFIER NOT NULL,
        QuestionId               UNIQUEIDENTIFIER NOT NULL,
        ChoiceId                 UNIQUEIDENTIFIER NULL,
        AnswerText               NVARCHAR(MAX) NULL,
        IsCorrect                BIT NOT NULL CONSTRAINT DF_Judge_QuizAnswers_IsCorrect DEFAULT(0),
        PointsEarned             DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_QuizAnswers_PointsEarned DEFAULT(0),
        AnsweredAt               DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_QuizAnswers_AnsweredAt DEFAULT SYSUTCDATETIME(),
        FeedbackText             NVARCHAR(MAX) NULL,
        CONSTRAINT UQ_Judge_QuizAnswers UNIQUE (QuizAttemptId, QuestionId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_UserProgress', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserProgress
    (
        UserProgressId           UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        ProgressType             NVARCHAR(30) NOT NULL,
        EntityId                 UNIQUEIDENTIFIER NOT NULL,
        Status                   NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_UserProgress_Status DEFAULT(N'not_started'),
        CompletionPercent        DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_UserProgress_CompletionPercent DEFAULT(0),
        CurrentStep              INT NULL,
        TotalSteps               INT NULL,
        PointsEarned             INT NOT NULL CONSTRAINT DF_Judge_UserProgress_PointsEarned DEFAULT(0),
        XpEarned                 INT NOT NULL CONSTRAINT DF_Judge_UserProgress_XpEarned DEFAULT(0),
        StartedAt                DATETIME2(0) NULL,
        LastActivityAt           DATETIME2(0) NULL,
        CompletedAt              DATETIME2(0) NULL,
        MetadataJson             NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserProgress_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_UserProgress UNIQUE (UserId, ProgressType, EntityId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_UserPathStates', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserPathStates
    (
        UserPathStateId          UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        PathId                   UNIQUEIDENTIFIER NOT NULL,
        Status                   NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_UserPathStates_Status DEFAULT(N'locked'),
        IsUnlocked               BIT NOT NULL CONSTRAINT DF_Judge_UserPathStates_IsUnlocked DEFAULT(0),
        UnlockedAt               DATETIME2(0) NULL,
        StartedAt                DATETIME2(0) NULL,
        LastActivityAt           DATETIME2(0) NULL,
        CompletedAt              DATETIME2(0) NULL,
        CompletionPercent        DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_UserPathStates_CompletionPercent DEFAULT(0),
        LessonsCompletedCount    INT NOT NULL CONSTRAINT DF_Judge_UserPathStates_LessonsCompletedCount DEFAULT(0),
        TotalLessonsCount        INT NOT NULL CONSTRAINT DF_Judge_UserPathStates_TotalLessonsCount DEFAULT(0),
        CurrentLessonId          UNIQUEIDENTIFIER NULL,
        MetadataJson             NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserPathStates_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_UserPathStates UNIQUE (UserId, PathId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_UserLessonStates', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserLessonStates
    (
        UserLessonStateId        UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        LessonId                 UNIQUEIDENTIFIER NOT NULL,
        Status                   NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_UserLessonStates_Status DEFAULT(N'not_started'),
        CompletionPercent        DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_UserLessonStates_CompletionPercent DEFAULT(0),
        CurrentLessonItemId      UNIQUEIDENTIFIER NULL,
        StartedAt                DATETIME2(0) NULL,
        LastViewedAt             DATETIME2(0) NULL,
        CompletedAt              DATETIME2(0) NULL,
        Notes                    NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserLessonStates_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_UserLessonStates UNIQUE (UserId, LessonId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_UserXP', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserXP
    (
        UserXpId                 UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        SourceType               NVARCHAR(30) NOT NULL,
        SourceId                 UNIQUEIDENTIFIER NULL,
        XpDelta                  INT NOT NULL,
        Reason                   NVARCHAR(300) NULL,
        BalanceAfter             INT NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserXP_CreatedAt DEFAULT SYSUTCDATETIME(),
        MetadataJson             NVARCHAR(MAX) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_UserStreaks', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserStreaks
    (
        UserStreakId             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        CurrentStreakDays        INT NOT NULL CONSTRAINT DF_Judge_UserStreaks_CurrentStreakDays DEFAULT(0),
        LongestStreakDays        INT NOT NULL CONSTRAINT DF_Judge_UserStreaks_LongestStreakDays DEFAULT(0),
        LastLearningDate         DATE NULL,
        FreezeCount              INT NOT NULL CONSTRAINT DF_Judge_UserStreaks_FreezeCount DEFAULT(0),
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserStreaks_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_UserStreaks UNIQUE (UserId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_Badges', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_Badges
    (
        BadgeId                  UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        Code                     NVARCHAR(100) NOT NULL,
        Name                     NVARCHAR(200) NOT NULL,
        Description              NVARCHAR(MAX) NULL,
        IconUrl                  NVARCHAR(1000) NULL,
        ColorHex                 NVARCHAR(20) NULL,
        Category                 NVARCHAR(50) NULL,
        Rarity                   NVARCHAR(30) NULL,
        PointsReward             INT NOT NULL CONSTRAINT DF_Judge_Badges_PointsReward DEFAULT(0),
        XpReward                 INT NOT NULL CONSTRAINT DF_Judge_Badges_XpReward DEFAULT(0),
        IsActive                 BIT NOT NULL CONSTRAINT DF_Judge_Badges_IsActive DEFAULT(1),
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Badges_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Judge_Badges_Code UNIQUE (Code)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_BadgeRules', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_BadgeRules
    (
        BadgeRuleId              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        BadgeId                  UNIQUEIDENTIFIER NOT NULL,
        RuleType                 NVARCHAR(50) NOT NULL,
        MetricName               NVARCHAR(100) NOT NULL,
        ComparisonOperator       NVARCHAR(20) NOT NULL,
        TargetValue              DECIMAL(18,2) NOT NULL,
        WindowDays               INT NULL,
        MetadataJson             NVARCHAR(MAX) NULL,
        IsActive                 BIT NOT NULL CONSTRAINT DF_Judge_BadgeRules_IsActive DEFAULT(1),
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_BadgeRules_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_UserBadges', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserBadges
    (
        UserBadgeId              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        BadgeId                  UNIQUEIDENTIFIER NOT NULL,
        AwardedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserBadges_AwardedAt DEFAULT SYSUTCDATETIME(),
        AwardedByRuleId          UNIQUEIDENTIFIER NULL,
        Note                     NVARCHAR(MAX) NULL,
        MetadataJson             NVARCHAR(MAX) NULL,
        CONSTRAINT UQ_Judge_UserBadges UNIQUE (UserId, BadgeId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_DailyChallenges', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_DailyChallenges
    (
        ChallengeId              UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        Title                    NVARCHAR(300) NOT NULL,
        Description              NVARCHAR(MAX) NULL,
        ChallengeType            NVARCHAR(50) NOT NULL,
        TargetMetric             NVARCHAR(100) NOT NULL,
        TargetValue              DECIMAL(18,2) NOT NULL,
        TopicId                  UNIQUEIDENTIFIER NULL,
        SkillTagId               UNIQUEIDENTIFIER NULL,
        ProblemId                UNIQUEIDENTIFIER NULL,
        QuizId                   UNIQUEIDENTIFIER NULL,
        StartsAt                 DATETIME2(0) NOT NULL,
        EndsAt                   DATETIME2(0) NOT NULL,
        XpReward                 INT NOT NULL CONSTRAINT DF_Judge_DailyChallenges_XpReward DEFAULT(0),
        PointsReward             INT NOT NULL CONSTRAINT DF_Judge_DailyChallenges_PointsReward DEFAULT(0),
        BadgeId                  UNIQUEIDENTIFIER NULL,
        IsActive                 BIT NOT NULL CONSTRAINT DF_Judge_DailyChallenges_IsActive DEFAULT(1),
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_DailyChallenges_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_UserChallengeProgress', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_UserChallengeProgress
    (
        UserChallengeProgressId  UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        UserId                   UNIQUEIDENTIFIER NOT NULL,
        ChallengeId              UNIQUEIDENTIFIER NOT NULL,
        CurrentValue             DECIMAL(18,2) NOT NULL CONSTRAINT DF_Judge_UserChallengeProgress_CurrentValue DEFAULT(0),
        TargetValue              DECIMAL(18,2) NOT NULL,
        Status                   NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_UserChallengeProgress_Status DEFAULT(N'in_progress'),
        CompletedAt              DATETIME2(0) NULL,
        RewardClaimedAt          DATETIME2(0) NULL,
        MetadataJson             NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserChallengeProgress_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt                DATETIME2(0) NULL,
        CONSTRAINT UQ_Judge_UserChallengeProgress UNIQUE (UserId, ChallengeId)
    );
END
GO

IF OBJECT_ID(N'dbo.Judge_RewardRules', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Judge_RewardRules
    (
        RewardRuleId             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        EventCode                NVARCHAR(100) NOT NULL,
        SourceType               NVARCHAR(50) NULL,
        DifficultyLevel          TINYINT NULL,
        PointsDelta              INT NOT NULL CONSTRAINT DF_Judge_RewardRules_PointsDelta DEFAULT(0),
        XpDelta                  INT NOT NULL CONSTRAINT DF_Judge_RewardRules_XpDelta DEFAULT(0),
        CoinsDelta               INT NOT NULL CONSTRAINT DF_Judge_RewardRules_CoinsDelta DEFAULT(0),
        IsActive                 BIT NOT NULL CONSTRAINT DF_Judge_RewardRules_IsActive DEFAULT(1),
        MetadataJson             NVARCHAR(MAX) NULL,
        CreatedAt                DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_RewardRules_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

/* =========================================================
   3) NON-BREAKING COLUMN UPGRADES
   ========================================================= */

IF COL_LENGTH('dbo.Judge_Languages', 'MonacoKey') IS NULL ALTER TABLE dbo.Judge_Languages ADD MonacoKey NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.Judge_Languages', 'FileExtension') IS NULL ALTER TABLE dbo.Judge_Languages ADD FileExtension NVARCHAR(20) NULL;
IF COL_LENGTH('dbo.Judge_Languages', 'CompileCommand') IS NULL ALTER TABLE dbo.Judge_Languages ADD CompileCommand NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Judge_Languages', 'RunCommand') IS NULL ALTER TABLE dbo.Judge_Languages ADD RunCommand NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Judge_Languages', 'TemplateCode') IS NULL ALTER TABLE dbo.Judge_Languages ADD TemplateCode NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Languages', 'SortOrder') IS NULL ALTER TABLE dbo.Judge_Languages ADD SortOrder INT NOT NULL CONSTRAINT DF_Judge_Languages_SortOrder_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_Languages', 'CreatedAt') IS NULL ALTER TABLE dbo.Judge_Languages ADD CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_Languages_CreatedAt_Upgrade DEFAULT SYSUTCDATETIME();
IF COL_LENGTH('dbo.Judge_Languages', 'UpdatedAt') IS NULL ALTER TABLE dbo.Judge_Languages ADD UpdatedAt DATETIME2(0) NULL;
GO

IF COL_LENGTH('dbo.Judge_Problems', 'ProblemType') IS NULL ALTER TABLE dbo.Judge_Problems ADD ProblemType NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_Problems_ProblemType_Upgrade DEFAULT(N'code');
IF COL_LENGTH('dbo.Judge_Problems', 'SubmissionMode') IS NULL ALTER TABLE dbo.Judge_Problems ADD SubmissionMode NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_Problems_SubmissionMode_Upgrade DEFAULT(N'code');
IF COL_LENGTH('dbo.Judge_Problems', 'DifficultyLevel') IS NULL ALTER TABLE dbo.Judge_Problems ADD DifficultyLevel TINYINT NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'PrimaryTopicId') IS NULL ALTER TABLE dbo.Judge_Problems ADD PrimaryTopicId UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'Topic') IS NULL ALTER TABLE dbo.Judge_Problems ADD Topic NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'SkillTag') IS NULL ALTER TABLE dbo.Judge_Problems ADD SkillTag NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'EstimatedMinutes') IS NULL ALTER TABLE dbo.Judge_Problems ADD EstimatedMinutes SMALLINT NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'PointsReward') IS NULL ALTER TABLE dbo.Judge_Problems ADD PointsReward INT NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'MaxScore') IS NULL ALTER TABLE dbo.Judge_Problems ADD MaxScore INT NOT NULL CONSTRAINT DF_Judge_Problems_MaxScore_Upgrade DEFAULT(100);
IF COL_LENGTH('dbo.Judge_Problems', 'PassPercentage') IS NULL ALTER TABLE dbo.Judge_Problems ADD PassPercentage DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_Problems_PassPercentage_Upgrade DEFAULT(100.00);
IF COL_LENGTH('dbo.Judge_Problems', 'InputFormat') IS NULL ALTER TABLE dbo.Judge_Problems ADD InputFormat NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'OutputFormat') IS NULL ALTER TABLE dbo.Judge_Problems ADD OutputFormat NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'ConstraintsText') IS NULL ALTER TABLE dbo.Judge_Problems ADD ConstraintsText NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'Notes') IS NULL ALTER TABLE dbo.Judge_Problems ADD Notes NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'HintText') IS NULL ALTER TABLE dbo.Judge_Problems ADD HintText NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'StarterCode') IS NULL ALTER TABLE dbo.Judge_Problems ADD StarterCode NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'StarterCodeByLanguage') IS NULL ALTER TABLE dbo.Judge_Problems ADD StarterCodeByLanguage NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'ReferenceSolution') IS NULL ALTER TABLE dbo.Judge_Problems ADD ReferenceSolution NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'EditorialText') IS NULL ALTER TABLE dbo.Judge_Problems ADD EditorialText NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'CheckerType') IS NULL ALTER TABLE dbo.Judge_Problems ADD CheckerType NVARCHAR(50) NOT NULL CONSTRAINT DF_Judge_Problems_CheckerType_Upgrade DEFAULT(N'exact');
IF COL_LENGTH('dbo.Judge_Problems', 'CheckerSourceCode') IS NULL ALTER TABLE dbo.Judge_Problems ADD CheckerSourceCode NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'AllowCustomInput') IS NULL ALTER TABLE dbo.Judge_Problems ADD AllowCustomInput BIT NOT NULL CONSTRAINT DF_Judge_Problems_AllowCustomInput_Upgrade DEFAULT(1);
IF COL_LENGTH('dbo.Judge_Problems', 'AllowPartialScoring') IS NULL ALTER TABLE dbo.Judge_Problems ADD AllowPartialScoring BIT NOT NULL CONSTRAINT DF_Judge_Problems_AllowPartialScoring_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_Problems', 'AllowAttachmentUpload') IS NULL ALTER TABLE dbo.Judge_Problems ADD AllowAttachmentUpload BIT NOT NULL CONSTRAINT DF_Judge_Problems_AllowAttachmentUpload_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_Problems', 'RequireReportFile') IS NULL ALTER TABLE dbo.Judge_Problems ADD RequireReportFile BIT NOT NULL CONSTRAINT DF_Judge_Problems_RequireReportFile_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_Problems', 'AttachmentRules') IS NULL ALTER TABLE dbo.Judge_Problems ADD AttachmentRules NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'VisibleFrom') IS NULL ALTER TABLE dbo.Judge_Problems ADD VisibleFrom DATETIME2(0) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'DueAt') IS NULL ALTER TABLE dbo.Judge_Problems ADD DueAt DATETIME2(0) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'MaxAttempts') IS NULL ALTER TABLE dbo.Judge_Problems ADD MaxAttempts INT NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'SourceType') IS NULL ALTER TABLE dbo.Judge_Problems ADD SourceType NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'CourseCode') IS NULL ALTER TABLE dbo.Judge_Problems ADD CourseCode NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'SemesterCode') IS NULL ALTER TABLE dbo.Judge_Problems ADD SemesterCode NVARCHAR(30) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'ChapterNo') IS NULL ALTER TABLE dbo.Judge_Problems ADD ChapterNo INT NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'LessonNo') IS NULL ALTER TABLE dbo.Judge_Problems ADD LessonNo INT NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'IsFeatured') IS NULL ALTER TABLE dbo.Judge_Problems ADD IsFeatured BIT NOT NULL CONSTRAINT DF_Judge_Problems_IsFeatured_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_Problems', 'SortOrder') IS NULL ALTER TABLE dbo.Judge_Problems ADD SortOrder INT NOT NULL CONSTRAINT DF_Judge_Problems_SortOrder_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_Problems', 'SupportedLanguagesJson') IS NULL ALTER TABLE dbo.Judge_Problems ADD SupportedLanguagesJson NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'MetadataJson') IS NULL ALTER TABLE dbo.Judge_Problems ADD MetadataJson NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Problems', 'RubricJson') IS NULL ALTER TABLE dbo.Judge_Problems ADD RubricJson NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH('dbo.Judge_TestCases', 'Name') IS NULL ALTER TABLE dbo.Judge_TestCases ADD Name NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'Description') IS NULL ALTER TABLE dbo.Judge_TestCases ADD Description NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'CaseGroup') IS NULL ALTER TABLE dbo.Judge_TestCases ADD CaseGroup NVARCHAR(100) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'Weight') IS NULL ALTER TABLE dbo.Judge_TestCases ADD Weight DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_TestCases_Weight_Upgrade DEFAULT(1);
IF COL_LENGTH('dbo.Judge_TestCases', 'IsHidden') IS NULL ALTER TABLE dbo.Judge_TestCases ADD IsHidden BIT NOT NULL CONSTRAINT DF_Judge_TestCases_IsHidden_Upgrade DEFAULT(1);
IF COL_LENGTH('dbo.Judge_TestCases', 'InputText') IS NULL ALTER TABLE dbo.Judge_TestCases ADD InputText NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'ExpectedOutputText') IS NULL ALTER TABLE dbo.Judge_TestCases ADD ExpectedOutputText NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'InputFileName') IS NULL ALTER TABLE dbo.Judge_TestCases ADD InputFileName NVARCHAR(255) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'OutputFileName') IS NULL ALTER TABLE dbo.Judge_TestCases ADD OutputFileName NVARCHAR(255) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'MaxTimeMs') IS NULL ALTER TABLE dbo.Judge_TestCases ADD MaxTimeMs INT NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'MaxMemoryKB') IS NULL ALTER TABLE dbo.Judge_TestCases ADD MaxMemoryKB INT NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'CheckerConfigJson') IS NULL ALTER TABLE dbo.Judge_TestCases ADD CheckerConfigJson NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'Notes') IS NULL ALTER TABLE dbo.Judge_TestCases ADD Notes NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_TestCases', 'CreatedAt') IS NULL ALTER TABLE dbo.Judge_TestCases ADD CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_TestCases_CreatedAt_Upgrade DEFAULT SYSUTCDATETIME();
IF COL_LENGTH('dbo.Judge_TestCases', 'UpdatedAt') IS NULL ALTER TABLE dbo.Judge_TestCases ADD UpdatedAt DATETIME2(0) NULL;
GO

IF COL_LENGTH('dbo.Judge_Submissions', 'AttemptNo') IS NULL ALTER TABLE dbo.Judge_Submissions ADD AttemptNo INT NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'SubmissionType') IS NULL ALTER TABLE dbo.Judge_Submissions ADD SubmissionType NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_Submissions_SubmissionType_Upgrade DEFAULT(N'normal');
IF COL_LENGTH('dbo.Judge_Submissions', 'IsPractice') IS NULL ALTER TABLE dbo.Judge_Submissions ADD IsPractice BIT NOT NULL CONSTRAINT DF_Judge_Submissions_IsPractice_Upgrade DEFAULT(1);
IF COL_LENGTH('dbo.Judge_Submissions', 'MaxScore') IS NULL ALTER TABLE dbo.Judge_Submissions ADD MaxScore DECIMAL(10,2) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'PassedTestCount') IS NULL ALTER TABLE dbo.Judge_Submissions ADD PassedTestCount INT NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'FailedTestCount') IS NULL ALTER TABLE dbo.Judge_Submissions ADD FailedTestCount INT NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'TotalTestCount') IS NULL ALTER TABLE dbo.Judge_Submissions ADD TotalTestCount INT NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'PassRate') IS NULL ALTER TABLE dbo.Judge_Submissions ADD PassRate DECIMAL(5,2) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'EarnedXp') IS NULL ALTER TABLE dbo.Judge_Submissions ADD EarnedXp INT NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'SubmittedIp') IS NULL ALTER TABLE dbo.Judge_Submissions ADD SubmittedIp NVARCHAR(64) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'UserAgent') IS NULL ALTER TABLE dbo.Judge_Submissions ADD UserAgent NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'QueueToken') IS NULL ALTER TABLE dbo.Judge_Submissions ADD QueueToken NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'StartedAt') IS NULL ALTER TABLE dbo.Judge_Submissions ADD StartedAt DATETIME2(0) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'JudgedAt') IS NULL ALTER TABLE dbo.Judge_Submissions ADD JudgedAt DATETIME2(0) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'IsFinal') IS NULL ALTER TABLE dbo.Judge_Submissions ADD IsFinal BIT NOT NULL CONSTRAINT DF_Judge_Submissions_IsFinal_Upgrade DEFAULT(1);
IF COL_LENGTH('dbo.Judge_Submissions', 'Visibility') IS NULL ALTER TABLE dbo.Judge_Submissions ADD Visibility NVARCHAR(20) NOT NULL CONSTRAINT DF_Judge_Submissions_Visibility_Upgrade DEFAULT(N'private');
IF COL_LENGTH('dbo.Judge_Submissions', 'MetadataJson') IS NULL ALTER TABLE dbo.Judge_Submissions ADD MetadataJson NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'ReportFileUrl') IS NULL ALTER TABLE dbo.Judge_Submissions ADD ReportFileUrl NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'ReportFileName') IS NULL ALTER TABLE dbo.Judge_Submissions ADD ReportFileName NVARCHAR(255) NULL;
IF COL_LENGTH('dbo.Judge_Submissions', 'AttachmentJson') IS NULL ALTER TABLE dbo.Judge_Submissions ADD AttachmentJson NVARCHAR(MAX) NULL;
GO

IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'SubmissionTestResultId') IS NULL
BEGIN
    ALTER TABLE dbo.Judge_SubmissionTestResults ADD SubmissionTestResultId UNIQUEIDENTIFIER NULL;
    UPDATE dbo.Judge_SubmissionTestResults SET SubmissionTestResultId = NEWID() WHERE SubmissionTestResultId IS NULL;
    ALTER TABLE dbo.Judge_SubmissionTestResults ALTER COLUMN SubmissionTestResultId UNIQUEIDENTIFIER NOT NULL;
END
IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'ActualOutput') IS NULL ALTER TABLE dbo.Judge_SubmissionTestResults ADD ActualOutput NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'ExpectedOutput') IS NULL ALTER TABLE dbo.Judge_SubmissionTestResults ADD ExpectedOutput NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'ScoreEarned') IS NULL ALTER TABLE dbo.Judge_SubmissionTestResults ADD ScoreEarned DECIMAL(10,2) NULL;
IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'DiffText') IS NULL ALTER TABLE dbo.Judge_SubmissionTestResults ADD DiffText NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'CheckerNote') IS NULL ALTER TABLE dbo.Judge_SubmissionTestResults ADD CheckerNote NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'IsSampleCase') IS NULL ALTER TABLE dbo.Judge_SubmissionTestResults ADD IsSampleCase BIT NULL;
IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'CaseOrderNo') IS NULL ALTER TABLE dbo.Judge_SubmissionTestResults ADD CaseOrderNo INT NULL;
IF COL_LENGTH('dbo.Judge_SubmissionTestResults', 'ExecutionToken') IS NULL ALTER TABLE dbo.Judge_SubmissionTestResults ADD ExecutionToken NVARCHAR(100) NULL;
GO

IF COL_LENGTH('dbo.Judge_UserProblemStats', 'UserProblemStatId') IS NULL
BEGIN
    ALTER TABLE dbo.Judge_UserProblemStats ADD UserProblemStatId UNIQUEIDENTIFIER NULL;
    UPDATE dbo.Judge_UserProblemStats SET UserProblemStatId = NEWID() WHERE UserProblemStatId IS NULL;
    ALTER TABLE dbo.Judge_UserProblemStats ALTER COLUMN UserProblemStatId UNIQUEIDENTIFIER NOT NULL;
END
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'BestScore') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD BestScore DECIMAL(10,2) NOT NULL CONSTRAINT DF_Judge_UserProblemStats_BestScore_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'AcceptedCount') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD AcceptedCount INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_AcceptedCount_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'PartialCount') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD PartialCount INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_PartialCount_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'WrongAnswerCount') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD WrongAnswerCount INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_WrongAnswerCount_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'RuntimeErrorCount') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD RuntimeErrorCount INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_RuntimeErrorCount_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'CompilationErrorCount') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD CompilationErrorCount INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_CompilationErrorCount_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'LastLanguageId') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD LastLanguageId INT NULL;
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'LastScore') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD LastScore DECIMAL(10,2) NULL;
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'CompletionPercent') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD CompletionPercent DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_UserProblemStats_CompletionPercent_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'TotalTimeSpentMinutes') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD TotalTimeSpentMinutes INT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_TotalTimeSpentMinutes_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'IsBookmarked') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD IsBookmarked BIT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_IsBookmarked_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'IsFavorite') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD IsFavorite BIT NOT NULL CONSTRAINT DF_Judge_UserProblemStats_IsFavorite_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'LastViewedAt') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD LastViewedAt DATETIME2(0) NULL;
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'CreatedAt') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_UserProblemStats_CreatedAt_Upgrade DEFAULT SYSUTCDATETIME();
IF COL_LENGTH('dbo.Judge_UserProblemStats', 'UpdatedAt') IS NULL ALTER TABLE dbo.Judge_UserProblemStats ADD UpdatedAt DATETIME2(0) NULL;
GO

IF COL_LENGTH('dbo.Judge_LearningPaths', 'UnlockRule') IS NULL ALTER TABLE dbo.Judge_LearningPaths ADD UnlockRule NVARCHAR(30) NOT NULL CONSTRAINT DF_Judge_LearningPaths_UnlockRule_Upgrade DEFAULT(N'prerequisite');
IF COL_LENGTH('dbo.Judge_LearningPaths', 'MinimumXpRequired') IS NULL ALTER TABLE dbo.Judge_LearningPaths ADD MinimumXpRequired INT NOT NULL CONSTRAINT DF_Judge_LearningPaths_MinimumXpRequired_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_LearningPaths', 'MinimumCompletionPercent') IS NULL ALTER TABLE dbo.Judge_LearningPaths ADD MinimumCompletionPercent DECIMAL(5,2) NOT NULL CONSTRAINT DF_Judge_LearningPaths_MinimumCompletionPercent_Upgrade DEFAULT(100.00);
GO

IF COL_LENGTH('dbo.Judge_OutboxEvents', 'RetryCount') IS NULL ALTER TABLE dbo.Judge_OutboxEvents ADD RetryCount INT NOT NULL CONSTRAINT DF_Judge_OutboxEvents_RetryCount_Upgrade DEFAULT(0);
IF COL_LENGTH('dbo.Judge_OutboxEvents', 'ErrorMessage') IS NULL ALTER TABLE dbo.Judge_OutboxEvents ADD ErrorMessage NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.Judge_OutboxEvents', 'LockedUntil') IS NULL ALTER TABLE dbo.Judge_OutboxEvents ADD LockedUntil DATETIME2(0) NULL;
IF COL_LENGTH('dbo.Judge_OutboxEvents', 'CreatedAt') IS NULL ALTER TABLE dbo.Judge_OutboxEvents ADD CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Judge_OutboxEvents_CreatedAt_Upgrade DEFAULT SYSUTCDATETIME();
GO

/* =========================================================
   4) FOREIGN KEYS
   ========================================================= */

IF OBJECT_ID(N'FK_Judge_Topics_Parent', N'F') IS NULL
    ALTER TABLE dbo.Judge_Topics ADD CONSTRAINT FK_Judge_Topics_Parent FOREIGN KEY (ParentTopicId) REFERENCES dbo.Judge_Topics(TopicId);

IF OBJECT_ID(N'FK_Judge_SkillTags_Topic', N'F') IS NULL
    ALTER TABLE dbo.Judge_SkillTags ADD CONSTRAINT FK_Judge_SkillTags_Topic FOREIGN KEY (TopicId) REFERENCES dbo.Judge_Topics(TopicId);

IF OBJECT_ID(N'FK_Judge_Problems_PrimaryTopic', N'F') IS NULL AND COL_LENGTH('dbo.Judge_Problems', 'PrimaryTopicId') IS NOT NULL
    ALTER TABLE dbo.Judge_Problems ADD CONSTRAINT FK_Judge_Problems_PrimaryTopic FOREIGN KEY (PrimaryTopicId) REFERENCES dbo.Judge_Topics(TopicId);

IF OBJECT_ID(N'FK_Judge_ProblemAllowedLanguages_Problem', N'F') IS NULL
    ALTER TABLE dbo.Judge_ProblemAllowedLanguages ADD CONSTRAINT FK_Judge_ProblemAllowedLanguages_Problem FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId);
IF OBJECT_ID(N'FK_Judge_ProblemAllowedLanguages_Language', N'F') IS NULL
    ALTER TABLE dbo.Judge_ProblemAllowedLanguages ADD CONSTRAINT FK_Judge_ProblemAllowedLanguages_Language FOREIGN KEY (LanguageId) REFERENCES dbo.Judge_Languages(LanguageId);

IF OBJECT_ID(N'FK_Judge_ProblemSkillTags_Problem', N'F') IS NULL
    ALTER TABLE dbo.Judge_ProblemSkillTags ADD CONSTRAINT FK_Judge_ProblemSkillTags_Problem FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId);
IF OBJECT_ID(N'FK_Judge_ProblemSkillTags_SkillTag', N'F') IS NULL
    ALTER TABLE dbo.Judge_ProblemSkillTags ADD CONSTRAINT FK_Judge_ProblemSkillTags_SkillTag FOREIGN KEY (SkillTagId) REFERENCES dbo.Judge_SkillTags(SkillTagId);

IF OBJECT_ID(N'FK_Judge_ProblemResources_Problem', N'F') IS NULL
    ALTER TABLE dbo.Judge_ProblemResources ADD CONSTRAINT FK_Judge_ProblemResources_Problem FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId);

IF OBJECT_ID(N'FK_Judge_TestCases_Problem', N'F') IS NULL
    ALTER TABLE dbo.Judge_TestCases ADD CONSTRAINT FK_Judge_TestCases_Problem FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId);

IF OBJECT_ID(N'FK_Judge_Submissions_Problem', N'F') IS NULL
    ALTER TABLE dbo.Judge_Submissions ADD CONSTRAINT FK_Judge_Submissions_Problem FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId);
IF OBJECT_ID(N'FK_Judge_Submissions_Language', N'F') IS NULL
    ALTER TABLE dbo.Judge_Submissions ADD CONSTRAINT FK_Judge_Submissions_Language FOREIGN KEY (LanguageId) REFERENCES dbo.Judge_Languages(LanguageId);

IF OBJECT_ID(N'FK_Judge_SubmissionFiles_Submission', N'F') IS NULL
    ALTER TABLE dbo.Judge_SubmissionFiles ADD CONSTRAINT FK_Judge_SubmissionFiles_Submission FOREIGN KEY (SubmissionId) REFERENCES dbo.Judge_Submissions(SubmissionId);

IF OBJECT_ID(N'FK_Judge_SubmissionTestResults_Submission', N'F') IS NULL
    ALTER TABLE dbo.Judge_SubmissionTestResults ADD CONSTRAINT FK_Judge_SubmissionTestResults_Submission FOREIGN KEY (SubmissionId) REFERENCES dbo.Judge_Submissions(SubmissionId);
IF OBJECT_ID(N'FK_Judge_SubmissionTestResults_TestCase', N'F') IS NULL
    ALTER TABLE dbo.Judge_SubmissionTestResults ADD CONSTRAINT FK_Judge_SubmissionTestResults_TestCase FOREIGN KEY (TestCaseId) REFERENCES dbo.Judge_TestCases(TestCaseId);

IF OBJECT_ID(N'FK_Judge_Results_Submission', N'F') IS NULL
    ALTER TABLE dbo.Judge_Results ADD CONSTRAINT FK_Judge_Results_Submission FOREIGN KEY (SubmissionId) REFERENCES dbo.Judge_Submissions(SubmissionId);

IF OBJECT_ID(N'FK_Judge_UserProblemStats_Problem', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserProblemStats ADD CONSTRAINT FK_Judge_UserProblemStats_Problem FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId);
IF OBJECT_ID(N'FK_Judge_UserProblemStats_Language', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserProblemStats ADD CONSTRAINT FK_Judge_UserProblemStats_Language FOREIGN KEY (LastLanguageId) REFERENCES dbo.Judge_Languages(LanguageId);

IF OBJECT_ID(N'FK_Judge_PathPrerequisites_Path', N'F') IS NULL
    ALTER TABLE dbo.Judge_PathPrerequisites ADD CONSTRAINT FK_Judge_PathPrerequisites_Path FOREIGN KEY (PathId) REFERENCES dbo.Judge_LearningPaths(PathId);
IF OBJECT_ID(N'FK_Judge_PathPrerequisites_RequiredPath', N'F') IS NULL
    ALTER TABLE dbo.Judge_PathPrerequisites ADD CONSTRAINT FK_Judge_PathPrerequisites_RequiredPath FOREIGN KEY (RequiredPathId) REFERENCES dbo.Judge_LearningPaths(PathId);

IF OBJECT_ID(N'FK_Judge_Lessons_Path', N'F') IS NULL
    ALTER TABLE dbo.Judge_Lessons ADD CONSTRAINT FK_Judge_Lessons_Path FOREIGN KEY (PathId) REFERENCES dbo.Judge_LearningPaths(PathId);
IF OBJECT_ID(N'FK_Judge_Lessons_Topic', N'F') IS NULL
    ALTER TABLE dbo.Judge_Lessons ADD CONSTRAINT FK_Judge_Lessons_Topic FOREIGN KEY (TopicId) REFERENCES dbo.Judge_Topics(TopicId);

IF OBJECT_ID(N'FK_Judge_LessonItems_Lesson', N'F') IS NULL
    ALTER TABLE dbo.Judge_LessonItems ADD CONSTRAINT FK_Judge_LessonItems_Lesson FOREIGN KEY (LessonId) REFERENCES dbo.Judge_Lessons(LessonId);
IF OBJECT_ID(N'FK_Judge_LessonItems_UnlockAfter', N'F') IS NULL
    ALTER TABLE dbo.Judge_LessonItems ADD CONSTRAINT FK_Judge_LessonItems_UnlockAfter FOREIGN KEY (UnlockAfterLessonItemId) REFERENCES dbo.Judge_LessonItems(LessonItemId);

IF OBJECT_ID(N'FK_Judge_LessonProblemMap_Lesson', N'F') IS NULL
    ALTER TABLE dbo.Judge_LessonProblemMap ADD CONSTRAINT FK_Judge_LessonProblemMap_Lesson FOREIGN KEY (LessonId) REFERENCES dbo.Judge_Lessons(LessonId);
IF OBJECT_ID(N'FK_Judge_LessonProblemMap_Problem', N'F') IS NULL
    ALTER TABLE dbo.Judge_LessonProblemMap ADD CONSTRAINT FK_Judge_LessonProblemMap_Problem FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId);

IF OBJECT_ID(N'FK_Judge_Quizzes_Lesson', N'F') IS NULL
    ALTER TABLE dbo.Judge_Quizzes ADD CONSTRAINT FK_Judge_Quizzes_Lesson FOREIGN KEY (LessonId) REFERENCES dbo.Judge_Lessons(LessonId);
IF OBJECT_ID(N'FK_Judge_Quizzes_Path', N'F') IS NULL
    ALTER TABLE dbo.Judge_Quizzes ADD CONSTRAINT FK_Judge_Quizzes_Path FOREIGN KEY (PathId) REFERENCES dbo.Judge_LearningPaths(PathId);

IF OBJECT_ID(N'FK_Judge_LessonQuizMap_Lesson', N'F') IS NULL
    ALTER TABLE dbo.Judge_LessonQuizMap ADD CONSTRAINT FK_Judge_LessonQuizMap_Lesson FOREIGN KEY (LessonId) REFERENCES dbo.Judge_Lessons(LessonId);
IF OBJECT_ID(N'FK_Judge_LessonQuizMap_Quiz', N'F') IS NULL
    ALTER TABLE dbo.Judge_LessonQuizMap ADD CONSTRAINT FK_Judge_LessonQuizMap_Quiz FOREIGN KEY (QuizId) REFERENCES dbo.Judge_Quizzes(QuizId);

IF OBJECT_ID(N'FK_Judge_QuizQuestions_Quiz', N'F') IS NULL
    ALTER TABLE dbo.Judge_QuizQuestions ADD CONSTRAINT FK_Judge_QuizQuestions_Quiz FOREIGN KEY (QuizId) REFERENCES dbo.Judge_Quizzes(QuizId);
IF OBJECT_ID(N'FK_Judge_QuizQuestions_Topic', N'F') IS NULL
    ALTER TABLE dbo.Judge_QuizQuestions ADD CONSTRAINT FK_Judge_QuizQuestions_Topic FOREIGN KEY (TopicId) REFERENCES dbo.Judge_Topics(TopicId);
IF OBJECT_ID(N'FK_Judge_QuizQuestions_SkillTag', N'F') IS NULL
    ALTER TABLE dbo.Judge_QuizQuestions ADD CONSTRAINT FK_Judge_QuizQuestions_SkillTag FOREIGN KEY (SkillTagId) REFERENCES dbo.Judge_SkillTags(SkillTagId);

IF OBJECT_ID(N'FK_Judge_QuizChoices_Question', N'F') IS NULL
    ALTER TABLE dbo.Judge_QuizChoices ADD CONSTRAINT FK_Judge_QuizChoices_Question FOREIGN KEY (QuestionId) REFERENCES dbo.Judge_QuizQuestions(QuestionId);

IF OBJECT_ID(N'FK_Judge_QuizAttempts_Quiz', N'F') IS NULL
    ALTER TABLE dbo.Judge_QuizAttempts ADD CONSTRAINT FK_Judge_QuizAttempts_Quiz FOREIGN KEY (QuizId) REFERENCES dbo.Judge_Quizzes(QuizId);

IF OBJECT_ID(N'FK_Judge_QuizAnswers_Attempt', N'F') IS NULL
    ALTER TABLE dbo.Judge_QuizAnswers ADD CONSTRAINT FK_Judge_QuizAnswers_Attempt FOREIGN KEY (QuizAttemptId) REFERENCES dbo.Judge_QuizAttempts(QuizAttemptId);
IF OBJECT_ID(N'FK_Judge_QuizAnswers_Question', N'F') IS NULL
    ALTER TABLE dbo.Judge_QuizAnswers ADD CONSTRAINT FK_Judge_QuizAnswers_Question FOREIGN KEY (QuestionId) REFERENCES dbo.Judge_QuizQuestions(QuestionId);
IF OBJECT_ID(N'FK_Judge_QuizAnswers_Choice', N'F') IS NULL
    ALTER TABLE dbo.Judge_QuizAnswers ADD CONSTRAINT FK_Judge_QuizAnswers_Choice FOREIGN KEY (ChoiceId) REFERENCES dbo.Judge_QuizChoices(ChoiceId);

IF OBJECT_ID(N'FK_Judge_UserPathStates_Path', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserPathStates ADD CONSTRAINT FK_Judge_UserPathStates_Path FOREIGN KEY (PathId) REFERENCES dbo.Judge_LearningPaths(PathId);
IF OBJECT_ID(N'FK_Judge_UserPathStates_CurrentLesson', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserPathStates ADD CONSTRAINT FK_Judge_UserPathStates_CurrentLesson FOREIGN KEY (CurrentLessonId) REFERENCES dbo.Judge_Lessons(LessonId);

IF OBJECT_ID(N'FK_Judge_UserLessonStates_Lesson', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserLessonStates ADD CONSTRAINT FK_Judge_UserLessonStates_Lesson FOREIGN KEY (LessonId) REFERENCES dbo.Judge_Lessons(LessonId);
IF OBJECT_ID(N'FK_Judge_UserLessonStates_CurrentItem', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserLessonStates ADD CONSTRAINT FK_Judge_UserLessonStates_CurrentItem FOREIGN KEY (CurrentLessonItemId) REFERENCES dbo.Judge_LessonItems(LessonItemId);

IF OBJECT_ID(N'FK_Judge_BadgeRules_Badge', N'F') IS NULL
    ALTER TABLE dbo.Judge_BadgeRules ADD CONSTRAINT FK_Judge_BadgeRules_Badge FOREIGN KEY (BadgeId) REFERENCES dbo.Judge_Badges(BadgeId);
IF OBJECT_ID(N'FK_Judge_UserBadges_Badge', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserBadges ADD CONSTRAINT FK_Judge_UserBadges_Badge FOREIGN KEY (BadgeId) REFERENCES dbo.Judge_Badges(BadgeId);
IF OBJECT_ID(N'FK_Judge_UserBadges_BadgeRule', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserBadges ADD CONSTRAINT FK_Judge_UserBadges_BadgeRule FOREIGN KEY (AwardedByRuleId) REFERENCES dbo.Judge_BadgeRules(BadgeRuleId);

IF OBJECT_ID(N'FK_Judge_DailyChallenges_Topic', N'F') IS NULL
    ALTER TABLE dbo.Judge_DailyChallenges ADD CONSTRAINT FK_Judge_DailyChallenges_Topic FOREIGN KEY (TopicId) REFERENCES dbo.Judge_Topics(TopicId);
IF OBJECT_ID(N'FK_Judge_DailyChallenges_SkillTag', N'F') IS NULL
    ALTER TABLE dbo.Judge_DailyChallenges ADD CONSTRAINT FK_Judge_DailyChallenges_SkillTag FOREIGN KEY (SkillTagId) REFERENCES dbo.Judge_SkillTags(SkillTagId);
IF OBJECT_ID(N'FK_Judge_DailyChallenges_Problem', N'F') IS NULL
    ALTER TABLE dbo.Judge_DailyChallenges ADD CONSTRAINT FK_Judge_DailyChallenges_Problem FOREIGN KEY (ProblemId) REFERENCES dbo.Judge_Problems(ProblemId);
IF OBJECT_ID(N'FK_Judge_DailyChallenges_Quiz', N'F') IS NULL
    ALTER TABLE dbo.Judge_DailyChallenges ADD CONSTRAINT FK_Judge_DailyChallenges_Quiz FOREIGN KEY (QuizId) REFERENCES dbo.Judge_Quizzes(QuizId);
IF OBJECT_ID(N'FK_Judge_DailyChallenges_Badge', N'F') IS NULL
    ALTER TABLE dbo.Judge_DailyChallenges ADD CONSTRAINT FK_Judge_DailyChallenges_Badge FOREIGN KEY (BadgeId) REFERENCES dbo.Judge_Badges(BadgeId);

IF OBJECT_ID(N'FK_Judge_UserChallengeProgress_Challenge', N'F') IS NULL
    ALTER TABLE dbo.Judge_UserChallengeProgress ADD CONSTRAINT FK_Judge_UserChallengeProgress_Challenge FOREIGN KEY (ChallengeId) REFERENCES dbo.Judge_DailyChallenges(ChallengeId);
GO

/* =========================================================
   5) INDEXES
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_Problems_Difficulty' AND object_id = OBJECT_ID(N'dbo.Judge_Problems'))
    CREATE INDEX IX_Judge_Problems_Difficulty ON dbo.Judge_Problems(Difficulty, IsPublic, Status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_Problems_PrimaryTopic' AND object_id = OBJECT_ID(N'dbo.Judge_Problems'))
    CREATE INDEX IX_Judge_Problems_PrimaryTopic ON dbo.Judge_Problems(PrimaryTopicId, DifficultyLevel, IsFeatured);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_TestCases_Problem' AND object_id = OBJECT_ID(N'dbo.Judge_TestCases'))
    CREATE INDEX IX_Judge_TestCases_Problem ON dbo.Judge_TestCases(ProblemId, OrderNo, IsSample, IsHidden);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_Submissions_User_Problem' AND object_id = OBJECT_ID(N'dbo.Judge_Submissions'))
    CREATE INDEX IX_Judge_Submissions_User_Problem ON dbo.Judge_Submissions(UserId, ProblemId, SubmittedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_Submissions_Status' AND object_id = OBJECT_ID(N'dbo.Judge_Submissions'))
    CREATE INDEX IX_Judge_Submissions_Status ON dbo.Judge_Submissions(Status, JudgedAt, ProblemId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_SubmissionTestResults_Submission' AND object_id = OBJECT_ID(N'dbo.Judge_SubmissionTestResults'))
    CREATE INDEX IX_Judge_SubmissionTestResults_Submission ON dbo.Judge_SubmissionTestResults(SubmissionId, CaseOrderNo, Status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_UserProblemStats_User' AND object_id = OBJECT_ID(N'dbo.Judge_UserProblemStats'))
    CREATE INDEX IX_Judge_UserProblemStats_User ON dbo.Judge_UserProblemStats(UserId, BestStatus, BestScore DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_OutboxEvents_Process' AND object_id = OBJECT_ID(N'dbo.Judge_OutboxEvents'))
    CREATE INDEX IX_Judge_OutboxEvents_Process ON dbo.Judge_OutboxEvents(ProcessedAt, OccurredAt, RetryCount);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_PathPrerequisites_Path' AND object_id = OBJECT_ID(N'dbo.Judge_PathPrerequisites'))
    CREATE INDEX IX_Judge_PathPrerequisites_Path ON dbo.Judge_PathPrerequisites(PathId, SortOrder, RequiredPathId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_Lessons_Path' AND object_id = OBJECT_ID(N'dbo.Judge_Lessons'))
    CREATE INDEX IX_Judge_Lessons_Path ON dbo.Judge_Lessons(PathId, SortOrder, IsPublished);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_LessonItems_Lesson' AND object_id = OBJECT_ID(N'dbo.Judge_LessonItems'))
    CREATE INDEX IX_Judge_LessonItems_Lesson ON dbo.Judge_LessonItems(LessonId, SortOrder, ItemType);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_LessonProblemMap_Lesson' AND object_id = OBJECT_ID(N'dbo.Judge_LessonProblemMap'))
    CREATE INDEX IX_Judge_LessonProblemMap_Lesson ON dbo.Judge_LessonProblemMap(LessonId, SortOrder, ProblemId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_LessonQuizMap_Lesson' AND object_id = OBJECT_ID(N'dbo.Judge_LessonQuizMap'))
    CREATE INDEX IX_Judge_LessonQuizMap_Lesson ON dbo.Judge_LessonQuizMap(LessonId, SortOrder, QuizId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_QuizQuestions_Quiz' AND object_id = OBJECT_ID(N'dbo.Judge_QuizQuestions'))
    CREATE INDEX IX_Judge_QuizQuestions_Quiz ON dbo.Judge_QuizQuestions(QuizId, SortOrder, QuestionType);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_QuizAttempts_UserQuiz' AND object_id = OBJECT_ID(N'dbo.Judge_QuizAttempts'))
    CREATE INDEX IX_Judge_QuizAttempts_UserQuiz ON dbo.Judge_QuizAttempts(UserId, QuizId, StartedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_UserProgress_User' AND object_id = OBJECT_ID(N'dbo.Judge_UserProgress'))
    CREATE INDEX IX_Judge_UserProgress_User ON dbo.Judge_UserProgress(UserId, ProgressType, Status, LastActivityAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_UserPathStates_User' AND object_id = OBJECT_ID(N'dbo.Judge_UserPathStates'))
    CREATE INDEX IX_Judge_UserPathStates_User ON dbo.Judge_UserPathStates(UserId, IsUnlocked, Status, CompletionPercent DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_UserLessonStates_User' AND object_id = OBJECT_ID(N'dbo.Judge_UserLessonStates'))
    CREATE INDEX IX_Judge_UserLessonStates_User ON dbo.Judge_UserLessonStates(UserId, Status, CompletionPercent DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_UserXP_User' AND object_id = OBJECT_ID(N'dbo.Judge_UserXP'))
    CREATE INDEX IX_Judge_UserXP_User ON dbo.Judge_UserXP(UserId, CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_UserStreaks_User' AND object_id = OBJECT_ID(N'dbo.Judge_UserStreaks'))
    CREATE INDEX IX_Judge_UserStreaks_User ON dbo.Judge_UserStreaks(UserId, LastLearningDate DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Judge_DailyChallenges_Window' AND object_id = OBJECT_ID(N'dbo.Judge_DailyChallenges'))
    CREATE INDEX IX_Judge_DailyChallenges_Window ON dbo.Judge_DailyChallenges(IsActive, StartsAt, EndsAt);
GO

/* =========================================================
   6) SEED REWARD RULES
   ========================================================= */

MERGE dbo.Judge_RewardRules AS tgt
USING (VALUES
    (N'problem.accepted',      N'problem', 1, 10, 20, 0),
    (N'problem.accepted',      N'problem', 2, 15, 30, 0),
    (N'problem.accepted',      N'problem', 3, 20, 45, 0),
    (N'problem.accepted',      N'problem', 4, 30, 70, 0),
    (N'problem.accepted',      N'problem', 5, 50, 120, 0),
    (N'quiz.passed',           N'quiz',    NULL, 10, 15, 0),
    (N'lesson.completed',      N'lesson',  NULL,  5, 10, 0),
    (N'path.completed',        N'path',    NULL, 25, 50, 0),
    (N'daily.challenge.done',  N'challenge',NULL, 20, 30, 0)
) AS src(EventCode, SourceType, DifficultyLevel, PointsDelta, XpDelta, CoinsDelta)
ON tgt.EventCode = src.EventCode
AND ISNULL(tgt.SourceType, N'') = ISNULL(src.SourceType, N'')
AND ((tgt.DifficultyLevel = src.DifficultyLevel) OR (tgt.DifficultyLevel IS NULL AND src.DifficultyLevel IS NULL))
WHEN MATCHED THEN
    UPDATE SET
        tgt.PointsDelta = src.PointsDelta,
        tgt.XpDelta = src.XpDelta,
        tgt.CoinsDelta = src.CoinsDelta,
        tgt.IsActive = 1
WHEN NOT MATCHED THEN
    INSERT (RewardRuleId, EventCode, SourceType, DifficultyLevel, PointsDelta, XpDelta, CoinsDelta, IsActive, CreatedAt)
    VALUES (NEWID(), src.EventCode, src.SourceType, src.DifficultyLevel, src.PointsDelta, src.XpDelta, src.CoinsDelta, 1, SYSUTCDATETIME());
GO

PRINT N'JudgeDB full upgrade (rewritten) completed successfully.';

-- ========================================
-- SEED DATA: Unlock path-001-tong-hai-so-nguyen + Lesson 1
-- ========================================

-- Create Learning Path (unlocked by default, no prereqs, XP=0)
DECLARE @PathId UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.Judge_LearningPaths (PathId, Title, Slug, Description, EstimatedMinutes, TotalXpReward, MinimumXpRequired, Status, IsPublic, SortOrder, CreatedAt)
VALUES (@PathId, N'Path 001 - Tổng hai số nguyên', 'path-001-tong-hai-so-nguyen', N'Lộ trình bài 1: Học cách đọc input và tính tổng hai số nguyên đơn giản.', 10, 50, 0, 1, 1, 1, SYSUTCDATETIME());

-- Create Lesson 1 in path (published)
DECLARE @Lesson1Id UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.Judge_Lessons (LessonId, PathId, Title, Slug, Summary, EstimatedMinutes, PointsReward, XpReward, SortOrder, IsPublished, CreatedAt)
VALUES (@Lesson1Id, @PathId, N'Bài 1: Tổng hai số nguyên', 'lesson-001', N'Đọc 2 số nguyên từ input, tính tổng và in ra.', 10, 10, 25, 1, 1, SYSUTCDATETIME());

-- Create simple Problem for lesson (tong-hai-so)
DECLARE @ProblemId UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.Judge_Problems (ProblemId, Title, Slug, Difficulty, TimeLimitMs, MemoryLimitMB, Statement, CreatedByUserId, IsPublic, Status, CreatedAt, EstimatedMinutes, PointsReward)
VALUES (@ProblemId, N'Tổng hai số nguyên', 'tong-hai-so-nguyen', 1, 1000, 64, N'
**Input:** Dòng đầu chứa số test cases T (1 ≤ T ≤ 100). Mỗi test case 1 dòng chứa 2 số nguyên A, B (|A|,|B| ≤ 10^9).

**Output:** Với mỗi test case, in ra tổng A+B.

**Ví dụ:**
Input:
```
2
1 2
3 4
```
Output:
```
3
7
```

**Gợi ý:** Sử dụng long long / BigInt cho số lớn.', NEWID(), 1, 1, SYSUTCDATETIME(), 5, 10);

-- Link Problem to Lesson
INSERT INTO dbo.Judge_LessonProblemMap (LessonProblemMapId, LessonId, ProblemId, SortOrder, IsRequired, CreatedAt)
VALUES (NEWID(), @Lesson1Id, @ProblemId, 1, 1, SYSUTCDATETIME());

-- Create Lesson Item (problem reference)
DECLARE @LessonItem1Id UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.Judge_LessonItems (LessonItemId, LessonId, ItemType, RefId, Title, EstimatedMinutes, SortOrder, CreatedAt)
VALUES (@LessonItem1Id, @Lesson1Id, 'problem', @ProblemId, N'Thực hành: Code tổng hai số', 5, 1, SYSUTCDATETIME());

-- Seed testcases for Problem 1
INSERT INTO dbo.Judge_TestCases (TestCaseId, ProblemId, InputText, ExpectedOutputText, IsSample, Score, OrderNo, CreatedAt)
VALUES
    (NEWID(), @ProblemId, N'1
2 3', N'5', 1, 1, 1, SYSUTCDATETIME()),
    (NEWID(), @ProblemId, N'2
1 2
3 4', N'3
7', 0, 1, 2, SYSUTCDATETIME());

-- Create Problem 2 in same lesson to verify auto-unlock after AC
DECLARE @Problem2Id UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.Judge_Problems (ProblemId, Title, Slug, Difficulty, TimeLimitMs, MemoryLimitMB, Statement, CreatedByUserId, IsPublic, Status, CreatedAt, EstimatedMinutes, PointsReward)
VALUES (@Problem2Id, N'Tổng ba số nguyên', 'tong-ba-so-nguyen', 1, 1000, 64, N'
**Input:** Dòng đầu chứa số test cases T (1 ≤ T ≤ 100). Mỗi test case 1 dòng chứa 3 số nguyên A, B, C (|A|,|B|,|C| ≤ 10^9).

**Output:** Với mỗi test case, in ra tổng A+B+C.

**Ví dụ:**
Input:
```
2
1 2 3
3 4 5
```
Output:
```
6
12
```

**Gợi ý:** Tái sử dụng cách đọc input như bài trước, chỉ khác số lượng biến cần cộng.', NEWID(), 1, 1, SYSUTCDATETIME(), 5, 10);

INSERT INTO dbo.Judge_LessonProblemMap (LessonProblemMapId, LessonId, ProblemId, SortOrder, IsRequired, CreatedAt)
VALUES (NEWID(), @Lesson1Id, @Problem2Id, 2, 1, SYSUTCDATETIME());

DECLARE @LessonItem2Id UNIQUEIDENTIFIER = NEWID();
INSERT INTO dbo.Judge_LessonItems (LessonItemId, LessonId, ItemType, RefId, Title, EstimatedMinutes, IsRequired, UnlockAfterLessonItemId, SortOrder, CreatedAt)
VALUES (@LessonItem2Id, @Lesson1Id, 'problem', @Problem2Id, N'Thực hành tiếp: Code tổng ba số', 5, 1, @LessonItem1Id, 2, SYSUTCDATETIME());

INSERT INTO dbo.Judge_TestCases (TestCaseId, ProblemId, InputText, ExpectedOutputText, IsSample, Score, OrderNo, CreatedAt)
VALUES
    (NEWID(), @Problem2Id, N'1
2 3 4', N'9', 1, 1, 1, SYSUTCDATETIME()),
    (NEWID(), @Problem2Id, N'2
1 2 3
3 4 5', N'6
12', 0, 1, 2, SYSUTCDATETIME());

-- SEED Language JS (for problem)
IF NOT EXISTS (SELECT 1 FROM dbo.Judge_Languages WHERE Name = N'JavaScript')
INSERT INTO dbo.Judge_Languages (Name, FileExtension, MonacoKey, IsEnabled, SortOrder)
VALUES (N'JavaScript', '.js', 'javascript', 1, 1);

-- Allow JS for problem
GO
