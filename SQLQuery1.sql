use IT_social_platform
go

CREATE TABLE [User] (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,

    Gender NVARCHAR(10) CHECK (Gender IN ('male','female','other')) DEFAULT 'other',

    Avatar NVARCHAR(500) DEFAULT '',
    CoverPhoto NVARCHAR(500) DEFAULT '',

    Bio NVARCHAR(500) DEFAULT '',
    Birthday DATE NULL,
    Phone NVARCHAR(20),
    Address NVARCHAR(255),

    IsOnline BIT DEFAULT 0,
    LastLogin DATETIME2,

    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME()
);

CREATE TABLE UserFriend (
    UserId UNIQUEIDENTIFIER NOT NULL,
    FriendId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(20) CHECK (Status IN ('Pending','Accepted','Rejected')) DEFAULT 'Pending',

    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),

    CONSTRAINT PK_UserFriend PRIMARY KEY (UserId, FriendId),
    CONSTRAINT FK_UserFriend_User FOREIGN KEY (UserId) REFERENCES [User](UserId),
    CONSTRAINT FK_UserFriend_Friend FOREIGN KEY (FriendId) REFERENCES [User](UserId)
);
CREATE TABLE UserFollow (
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    FollowingId UNIQUEIDENTIFIER NOT NULL,

    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),

    CONSTRAINT PK_UserFollow PRIMARY KEY (FollowerId, FollowingId),
    CONSTRAINT FK_UserFollow_Follower FOREIGN KEY (FollowerId) REFERENCES [User](UserId),
    CONSTRAINT FK_UserFollow_Following FOREIGN KEY (FollowingId) REFERENCES [User](UserId)
);


CREATE TABLE Post (
    PostId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AuthorId UNIQUEIDENTIFIER NOT NULL,

    Content NVARCHAR(MAX),

    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Post_User FOREIGN KEY (AuthorId) REFERENCES [User](UserId)
);


CREATE TABLE PostMedia (
    MediaId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PostId UNIQUEIDENTIFIER NOT NULL,

    MediaUrl NVARCHAR(500) NOT NULL,
    MediaType NVARCHAR(20) CHECK (MediaType IN ('image','video','other')),

    CONSTRAINT FK_PostMedia_Post FOREIGN KEY (PostId) REFERENCES Post(PostId)
);


CREATE TABLE PostLike (
    PostId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,

    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),

    CONSTRAINT PK_PostLike PRIMARY KEY (PostId, UserId),
    CONSTRAINT FK_PostLike_Post FOREIGN KEY (PostId) REFERENCES Post(PostId),
    CONSTRAINT FK_PostLike_User FOREIGN KEY (UserId) REFERENCES [User](UserId)
);


CREATE TABLE PostComment (
    CommentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PostId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,

    Text NVARCHAR(1000) NOT NULL,

    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),

    CONSTRAINT FK_PostComment_Post FOREIGN KEY (PostId) REFERENCES Post(PostId),
    CONSTRAINT FK_PostComment_User FOREIGN KEY (UserId) REFERENCES [User](UserId)
);


CREATE TABLE Problem (
    ProblemId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    Title NVARCHAR(255) NOT NULL,
    Slug NVARCHAR(255) UNIQUE NOT NULL,

    Difficulty NVARCHAR(10) CHECK (Difficulty IN ('Easy','Medium','Hard')),

    Description NVARCHAR(MAX) NOT NULL,
    Constraints NVARCHAR(MAX),
    InputFormat NVARCHAR(MAX),
    OutputFormat NVARCHAR(MAX),

    SampleInput NVARCHAR(MAX),
    SampleOutput NVARCHAR(MAX),
    Explanation NVARCHAR(MAX),

    TimeLimit INT DEFAULT 2000,
    MemoryLimit INT DEFAULT 262144,

    IsPublished BIT DEFAULT 1,

    SolvedCount INT DEFAULT 0,
    SubmissionCount INT DEFAULT 0,

    CreatedBy UNIQUEIDENTIFIER NULL,

    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Problem_User FOREIGN KEY (CreatedBy) REFERENCES [User](UserId)
);


CREATE TABLE ProblemTag (
    ProblemId UNIQUEIDENTIFIER NOT NULL,
    Tag NVARCHAR(50) NOT NULL,

    CONSTRAINT PK_ProblemTag PRIMARY KEY (ProblemId, Tag),
    CONSTRAINT FK_ProblemTag_Problem FOREIGN KEY (ProblemId) REFERENCES Problem(ProblemId)
);


CREATE TABLE ProblemTestcase (
    TestcaseId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ProblemId UNIQUEIDENTIFIER NOT NULL,

    Input NVARCHAR(MAX) NOT NULL,
    Output NVARCHAR(MAX) NOT NULL,

    IsHidden BIT DEFAULT 1,
    Score INT DEFAULT 1,

    CONSTRAINT FK_Testcase_Problem FOREIGN KEY (ProblemId) REFERENCES Problem(ProblemId)
);


CREATE TABLE ProblemLanguage (
    ProblemId UNIQUEIDENTIFIER NOT NULL,
    Language NVARCHAR(50) NOT NULL,
    Judge0Id INT NOT NULL,

    CONSTRAINT PK_ProblemLanguage PRIMARY KEY (ProblemId, Language),
    CONSTRAINT FK_ProblemLanguage_Problem FOREIGN KEY (ProblemId) REFERENCES Problem(ProblemId)
);


CREATE TABLE Submission (
    SubmissionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    ProblemId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,

    Language NVARCHAR(50) NOT NULL,
    SourceCode NVARCHAR(MAX) NOT NULL,

    Status NVARCHAR(20) CHECK (Status IN ('Pending','Accepted','Wrong Answer','Time Limit','Runtime Error')),
    ExecutionTime INT,
    MemoryUsed INT,

    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Submission_Problem FOREIGN KEY (ProblemId) REFERENCES Problem(ProblemId),
    CONSTRAINT FK_Submission_User FOREIGN KEY (UserId) REFERENCES [User](UserId)
);


