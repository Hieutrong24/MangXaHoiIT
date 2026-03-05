DECLARE @HieuId UNIQUEIDENTIFIER = NEWID();
DECLARE @User2 UNIQUEIDENTIFIER = NEWID();
DECLARE @User3 UNIQUEIDENTIFIER = NEWID();
DECLARE @User4 UNIQUEIDENTIFIER = NEWID();
DECLARE @User5 UNIQUEIDENTIFIER = NEWID();

INSERT INTO [User] (UserId, Name, Email, PasswordHash, Gender, Bio)
VALUES
(@HieuId, N'Ngô Tr?ng Hi?u', 'ngotronghieu@gmail.com', 'hash123', 'male', N'Sinh viên CNTT'),
(@User2, N'Nguy?n Vãn An', 'nguyenvanan@gmail.com', 'hash123', 'male', N'Backend Developer'),
(@User3, N'Tr?n Th? B?nh', 'tranthibinh@gmail.com', 'hash123', 'female', N'UI/UX Designer'),
(@User4, N'Lê Qu?c Cý?ng', 'lequoccuong@gmail.com', 'hash123', 'male', N'AI Engineer'),
(@User5, N'Ph?m Minh Ð?c', 'phamminhduc@gmail.com', 'hash123', 'male', N'DevOps');


INSERT INTO UserFriend (UserId, FriendId, Status)
VALUES
(@HieuId, @User2, 'Accepted'),
(@HieuId, @User3, 'Pending'),
(@User2, @User3, 'Accepted'),
(@User3, @User4, 'Accepted'),
(@User4, @User5, 'Pending');


INSERT INTO UserFollow (FollowerId, FollowingId)
VALUES
(@HieuId, @User4),
(@HieuId, @User5),
(@User2, @HieuId),
(@User3, @HieuId),
(@User5, @User2);


DECLARE @Post1 UNIQUEIDENTIFIER = NEWID();
DECLARE @Post2 UNIQUEIDENTIFIER = NEWID();
DECLARE @Post3 UNIQUEIDENTIFIER = NEWID();
DECLARE @Post4 UNIQUEIDENTIFIER = NEWID();
DECLARE @Post5 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Post (PostId, AuthorId, Content)
VALUES
(@Post1, @HieuId, N'Hôm nay m?nh h?c Clean Architecture'),
(@Post2, @User2, N'Chia s? kinh nghi?m NodeJS'),
(@Post3, @User3, N'UI ð?p giúp UX t?t hõn'),
(@Post4, @User4, N'AI ðang thay ð?i th? gi?i'),
(@Post5, @User5, N'DevOps và CI/CD');


INSERT INTO PostMedia (PostId, MediaUrl, MediaType)
VALUES
(@Post1, 'https://img.com/clean.png', 'image'),
(@Post2, 'https://img.com/node.png', 'image'),
(@Post3, 'https://img.com/ui.png', 'image'),
(@Post4, 'https://video.com/ai.mp4', 'video'),
(@Post5, 'https://img.com/devops.png', 'image');


INSERT INTO PostLike (PostId, UserId)
VALUES
(@Post1, @User2),
(@Post1, @User3),
(@Post2, @HieuId),
(@Post3, @User4),
(@Post4, @User5);


INSERT INTO PostComment (PostId, UserId, Text)
VALUES
(@Post1, @User3, N'Bài vi?t hay quá'),
(@Post2, @HieuId, N'C?m õn b?n ð? chia s?'),
(@Post3, @User2, N'UI r?t quan tr?ng'),
(@Post4, @User5, N'AI r?t ti?m nãng'),
(@Post5, @User4, N'DevOps giúp t?i ýu h? th?ng');


DECLARE @P1 UNIQUEIDENTIFIER = NEWID();
DECLARE @P2 UNIQUEIDENTIFIER = NEWID();
DECLARE @P3 UNIQUEIDENTIFIER = NEWID();
DECLARE @P4 UNIQUEIDENTIFIER = NEWID();
DECLARE @P5 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Problem (ProblemId, Title, Slug, Difficulty, Description, CreatedBy)
VALUES
(@P1, N'T?ng 2 s?', 'sum-two-numbers', 'Easy', N'Tính t?ng hai s?', @HieuId),
(@P2, N'D?y Fibonacci', 'fibonacci', 'Easy', N'Tính Fibonacci', @User2),
(@P3, N'S?p x?p m?ng', 'sort-array', 'Medium', N'S?p x?p tãng d?n', @User3),
(@P4, N'T?m ðý?ng ði ng?n nh?t', 'shortest-path', 'Hard', N'Dijkstra', @User4),
(@P5, N'Chu?i Palindrome', 'palindrome', 'Easy', N'Ki?m tra Palindrome', @User5);


INSERT INTO ProblemTag
VALUES
(@P1, 'math'),
(@P2, 'dp'),
(@P3, 'sorting'),
(@P4, 'graph'),
(@P5, 'string');


INSERT INTO ProblemTestcase (ProblemId, Input, Output)
VALUES
(@P1, '1 2', '3'),
(@P2, '5', '5'),
(@P3, '3\n3 1 2', '1 2 3'),
(@P4, 'graph data', 'shortest path'),
(@P5, 'aba', 'true');


INSERT INTO ProblemLanguage
VALUES
(@P1, 'C++', 54),
(@P2, 'Java', 62),
(@P3, 'Python', 71),
(@P4, 'C#', 51),
(@P5, 'JavaScript', 63);

INSERT INTO Submission (ProblemId, UserId, Language, SourceCode, Status)
VALUES
(@P1, @HieuId, 'C++', '// code', 'Accepted'),
(@P2, @User2, 'Java', '// code', 'Wrong Answer'),
(@P3, @User3, 'Python', '# code', 'Accepted'),
(@P4, @User4, 'C#', '// code', 'Time Limit'),
(@P5, @User5, 'JS', '// code', 'Accepted');
