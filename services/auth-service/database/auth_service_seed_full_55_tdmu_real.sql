USE AuthDB;
GO

SET NOCOUNT ON;

/* =========================================================
   AUTH-SERVICE SEED DATA - TDMU REALISTIC SAMPLE
   Compatible with init.sql/AuthDB schema:
   - dbo.Auth_Accounts
   - dbo.Auth_Roles
   - dbo.Auth_UserRoles
   - dbo.Auth_RefreshTokens
   - dbo.Auth_LoginAuditLogs
   - dbo.Auth_OutboxEvents

   Ghi chú:
   - DB hiện KHÔNG có cột FullName/StudentCode trong Auth_Accounts.
     Vì vậy họ tên/MSSV được lưu trong dữ liệu seed tạm và PayloadJson của OutboxEvents.
   - Role được chỉnh lại đúng theo init.sql: admin, moderator, user.
   - Mật khẩu mẫu cho 55 tài khoản seed: Tdmu@123456
   ========================================================= */

/* ---------- Ensure base roles from init.sql exist ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Auth_Roles WHERE Name = N'admin')
    INSERT INTO dbo.Auth_Roles(Name, Description) VALUES (N'admin', N'System administrator');

IF NOT EXISTS (SELECT 1 FROM dbo.Auth_Roles WHERE Name = N'moderator')
    INSERT INTO dbo.Auth_Roles(Name, Description) VALUES (N'moderator', N'Content moderator');

IF NOT EXISTS (SELECT 1 FROM dbo.Auth_Roles WHERE Name = N'user')
    INSERT INTO dbo.Auth_Roles(Name, Description) VALUES (N'user', N'Default user role');
GO

IF OBJECT_ID('tempdb..#SeedUsersFullAuth') IS NOT NULL DROP TABLE #SeedUsersFullAuth;
IF OBJECT_ID('tempdb..#SeedAccountsToReplace') IS NOT NULL DROP TABLE #SeedAccountsToReplace;

CREATE TABLE #SeedUsersFullAuth
(
    UserNo      TINYINT          NOT NULL PRIMARY KEY,
    UserId      UNIQUEIDENTIFIER NOT NULL,
    Email       NVARCHAR(256)    NOT NULL,
    FullName    NVARCHAR(100)    NOT NULL,
    StudentCode NVARCHAR(20)     NULL,
    RoleName    NVARCHAR(50)     NOT NULL
);

/* 55 users với dữ liệu thật hơn: họ tên Việt Nam, email MSSV@student.tdmu.edu.vn hoặc email thường */
INSERT INTO #SeedUsersFullAuth(UserNo, UserId, Email, FullName, StudentCode, RoleName)
VALUES
(1,'10000001-aaaa-bbbb-cccc-000000000001',N'2023201001@student.tdmu.edu.vn',N'Nguyễn Văn An',N'2023201001',N'user'),
(2,'10000002-aaaa-bbbb-cccc-000000000002',N'2023201002@student.tdmu.edu.vn',N'Trần Thị Bảo Anh',N'2023201002',N'user'),
(3,'10000003-aaaa-bbbb-cccc-000000000003',N'2023201003@student.tdmu.edu.vn',N'Lê Minh Đức',N'2023201003',N'user'),
(4,'10000004-aaaa-bbbb-cccc-000000000004',N'2023201004@student.tdmu.edu.vn',N'Phạm Ngọc Hân',N'2023201004',N'user'),
(5,'10000005-aaaa-bbbb-cccc-000000000005',N'2023201005@student.tdmu.edu.vn',N'Huỳnh Gia Bảo',N'2023201005',N'user'),
(6,'10000006-aaaa-bbbb-cccc-000000000006',N'2023201006@student.tdmu.edu.vn',N'Võ Thị Thanh Trúc',N'2023201006',N'user'),
(7,'10000007-aaaa-bbbb-cccc-000000000007',N'2023201007@student.tdmu.edu.vn',N'Đặng Quốc Huy',N'2023201007',N'user'),
(8,'10000008-aaaa-bbbb-cccc-000000000008',N'2023201008@student.tdmu.edu.vn',N'Bùi Phương Linh',N'2023201008',N'user'),
(9,'10000009-aaaa-bbbb-cccc-000000000009',N'2023201009@student.tdmu.edu.vn',N'Ngô Hoàng Nam',N'2023201009',N'user'),
(10,'10000010-aaaa-bbbb-cccc-000000000010',N'2023201010@student.tdmu.edu.vn',N'Đỗ Thùy Dương',N'2023201010',N'user'),
(11,'10000011-aaaa-bbbb-cccc-000000000011',N'2023201011@student.tdmu.edu.vn',N'Nguyễn Minh Khang',N'2023201011',N'user'),
(12,'10000012-aaaa-bbbb-cccc-000000000012',N'2023201012@student.tdmu.edu.vn',N'Trần Gia Hân',N'2023201012',N'user'),
(13,'10000013-aaaa-bbbb-cccc-000000000013',N'2023201013@student.tdmu.edu.vn',N'Lê Anh Tuấn',N'2023201013',N'user'),
(14,'10000014-aaaa-bbbb-cccc-000000000014',N'2023201014@student.tdmu.edu.vn',N'Phạm Khánh Vy',N'2023201014',N'user'),
(15,'10000015-aaaa-bbbb-cccc-000000000015',N'2023201015@student.tdmu.edu.vn',N'Huỳnh Nhật Minh',N'2023201015',N'user'),
(16,'10000016-aaaa-bbbb-cccc-000000000016',N'2023201016@student.tdmu.edu.vn',N'Võ Hoàng Phúc',N'2023201016',N'user'),
(17,'10000017-aaaa-bbbb-cccc-000000000017',N'2023201017@student.tdmu.edu.vn',N'Đặng Thảo Nguyên',N'2023201017',N'user'),
(18,'10000018-aaaa-bbbb-cccc-000000000018',N'2023201018@student.tdmu.edu.vn',N'Bùi Đức Anh',N'2023201018',N'user'),
(19,'10000019-aaaa-bbbb-cccc-000000000019',N'2023201019@student.tdmu.edu.vn',N'Ngô Mỹ Duyên',N'2023201019',N'user'),
(20,'10000020-aaaa-bbbb-cccc-000000000020',N'2023201020@student.tdmu.edu.vn',N'Đỗ Quang Hưng',N'2023201020',N'user'),
(21,'10000021-aaaa-bbbb-cccc-000000000021',N'2023201021@student.tdmu.edu.vn',N'Nguyễn Kim Ngân',N'2023201021',N'user'),
(22,'10000022-aaaa-bbbb-cccc-000000000022',N'2023201022@student.tdmu.edu.vn',N'Trần Minh Quân',N'2023201022',N'user'),
(23,'10000023-aaaa-bbbb-cccc-000000000023',N'2023201023@student.tdmu.edu.vn',N'Lê Bảo Ngọc',N'2023201023',N'user'),
(24,'10000024-aaaa-bbbb-cccc-000000000024',N'2023201024@student.tdmu.edu.vn',N'Phạm Thành Đạt',N'2023201024',N'user'),
(25,'10000025-aaaa-bbbb-cccc-000000000025',N'2023201025@student.tdmu.edu.vn',N'Huỳnh Như Ý',N'2023201025',N'user'),
(26,'10000026-aaaa-bbbb-cccc-000000000026',N'2023201026@student.tdmu.edu.vn',N'Võ Minh Triết',N'2023201026',N'user'),
(27,'10000027-aaaa-bbbb-cccc-000000000027',N'2023201027@student.tdmu.edu.vn',N'Đặng Hải Yến',N'2023201027',N'user'),
(28,'10000028-aaaa-bbbb-cccc-000000000028',N'2023201028@student.tdmu.edu.vn',N'Bùi Thanh Tâm',N'2023201028',N'user'),
(29,'10000029-aaaa-bbbb-cccc-000000000029',N'2023201029@student.tdmu.edu.vn',N'Ngô Đức Duy',N'2023201029',N'user'),
(30,'10000030-aaaa-bbbb-cccc-000000000030',N'2023201030@student.tdmu.edu.vn',N'Đỗ Hà My',N'2023201030',N'user'),
(31,'10000031-aaaa-bbbb-cccc-000000000031',N'2023201031@student.tdmu.edu.vn',N'Nguyễn Tấn Phát',N'2023201031',N'user'),
(32,'10000032-aaaa-bbbb-cccc-000000000032',N'2023201032@student.tdmu.edu.vn',N'Trần Ngọc Mai',N'2023201032',N'user'),
(33,'10000033-aaaa-bbbb-cccc-000000000033',N'2023201033@student.tdmu.edu.vn',N'Lê Hoàng Long',N'2023201033',N'user'),
(34,'10000034-aaaa-bbbb-cccc-000000000034',N'2023201034@student.tdmu.edu.vn',N'Phạm Minh Châu',N'2023201034',N'user'),
(35,'10000035-aaaa-bbbb-cccc-000000000035',N'2023201035@student.tdmu.edu.vn',N'Huỳnh Anh Khoa',N'2023201035',N'user'),
(36,'10000036-aaaa-bbbb-cccc-000000000036',N'2023201036@student.tdmu.edu.vn',N'Võ Khánh Linh',N'2023201036',N'user'),
(37,'10000037-aaaa-bbbb-cccc-000000000037',N'2023201037@student.tdmu.edu.vn',N'Đặng Minh Nhật',N'2023201037',N'user'),
(38,'10000038-aaaa-bbbb-cccc-000000000038',N'2023201038@student.tdmu.edu.vn',N'Bùi Gia Huy',N'2023201038',N'user'),
(39,'10000039-aaaa-bbbb-cccc-000000000039',N'2023201039@student.tdmu.edu.vn',N'Ngô Thanh Thảo',N'2023201039',N'user'),
(40,'10000040-aaaa-bbbb-cccc-000000000040',N'2023201040@student.tdmu.edu.vn',N'Đỗ Nhật Tân',N'2023201040',N'user'),
(41,'10000041-aaaa-bbbb-cccc-000000000041',N'2023201041@student.tdmu.edu.vn',N'Nguyễn Phương Uyên',N'2023201041',N'user'),
(42,'10000042-aaaa-bbbb-cccc-000000000042',N'2023201042@student.tdmu.edu.vn',N'Trần Đức Việt',N'2023201042',N'user'),
(43,'10000043-aaaa-bbbb-cccc-000000000043',N'2023201043@student.tdmu.edu.vn',N'Lê Thu Hà',N'2023201043',N'user'),
(44,'10000044-aaaa-bbbb-cccc-000000000044',N'2023201044@student.tdmu.edu.vn',N'Phạm Gia Nghi',N'2023201044',N'user'),
(45,'10000045-aaaa-bbbb-cccc-000000000045',N'2023201045@student.tdmu.edu.vn',N'Huỳnh Công Thành',N'2023201045',N'user'),
(46,'10000046-aaaa-bbbb-cccc-000000000046',N'maianh.vo.tdmu@gmail.com',N'Võ Mai Anh',N'2020202046',N'user'),
(47,'10000047-aaaa-bbbb-cccc-000000000047',N'quangvinh.dang@outlook.com',N'Đặng Quang Vinh',N'2020202047',N'user'),
(48,'10000048-aaaa-bbbb-cccc-000000000048',N'ngocdiem.bui@gmail.com',N'Bùi Ngọc Diễm',N'2020202048',N'user'),
(49,'10000049-aaaa-bbbb-cccc-000000000049',N'minhtam.ngo@outlook.com',N'Ngô Minh Tâm',N'2020202049',N'user'),
(50,'10000050-aaaa-bbbb-cccc-000000000050',N'hoainam.do@gmail.com',N'Đỗ Hoài Nam',N'2020202050',N'user'),
(51,'10000051-aaaa-bbbb-cccc-000000000051',N'thanhbinh.nguyen@tdmu.edu.vn',N'Nguyễn Thanh Bình',NULL,N'moderator'),
(52,'10000052-aaaa-bbbb-cccc-000000000052',N'quockhanh.tran@tdmu.edu.vn',N'Trần Quốc Khánh',NULL,N'moderator'),
(53,'10000053-aaaa-bbbb-cccc-000000000053',N'mylinh.le@tdmu.edu.vn',N'Lê Mỹ Linh',NULL,N'moderator'),
(54,'10000054-aaaa-bbbb-cccc-000000000054',N'duykhoa.pham@tdmu.edu.vn',N'Phạm Duy Khoa',NULL,N'admin'),
(55,'10000055-aaaa-bbbb-cccc-000000000055',N'thaonhi.huynh@tdmu.edu.vn',N'Huỳnh Thảo Nhi',NULL,N'admin');

/* ---------------------------------------------------------
   Replace old demo seed safely
   - Xóa các tài khoản seed cũ theo UserId cố định hoặc email cũ user1@demo.local...
   - Không đụng tài khoản admin mặc định trong init.sql: admin@it-social.local
   --------------------------------------------------------- */
CREATE TABLE #SeedAccountsToReplace
(
    UserId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY
);

INSERT INTO #SeedAccountsToReplace(UserId)
SELECT DISTINCT a.UserId
FROM dbo.Auth_Accounts a
WHERE a.UserId IN (SELECT UserId FROM #SeedUsersFullAuth)
   OR a.Email IN (SELECT Email FROM #SeedUsersFullAuth)
   OR a.Email IN
   (
       N'user1@demo.local', N'user2@demo.local', N'user3@demo.local', N'user4@demo.local', N'user5@demo.local',
       N'user6@demo.local', N'user7@demo.local', N'user8@demo.local', N'user9@demo.local', N'user10@demo.local',
       N'user11@demo.local', N'user12@demo.local', N'user13@demo.local', N'user14@demo.local', N'user15@demo.local',
       N'user16@demo.local', N'user17@demo.local', N'user18@demo.local', N'user19@demo.local', N'user20@demo.local',
       N'user21@demo.local', N'user22@demo.local', N'user23@demo.local', N'user24@demo.local', N'user25@demo.local',
       N'user26@demo.local', N'user27@demo.local', N'user28@demo.local', N'user29@demo.local', N'user30@demo.local',
       N'user31@demo.local', N'user32@demo.local', N'user33@demo.local', N'user34@demo.local', N'user35@demo.local',
       N'user36@demo.local', N'user37@demo.local', N'user38@demo.local', N'user39@demo.local', N'user40@demo.local',
       N'user41@demo.local', N'user42@demo.local', N'user43@demo.local', N'user44@demo.local', N'user45@demo.local',
       N'user46@demo.local', N'user47@demo.local', N'user48@demo.local', N'user49@demo.local', N'user50@demo.local',
       N'user51@demo.local', N'user52@demo.local', N'user53@demo.local', N'user54@demo.local', N'user55@demo.local'
   );

DELETE FROM dbo.Auth_UserRoles
WHERE UserId IN (SELECT UserId FROM #SeedAccountsToReplace);

DELETE FROM dbo.Auth_RefreshTokens
WHERE UserId IN (SELECT UserId FROM #SeedAccountsToReplace);

DELETE FROM dbo.Auth_LoginAuditLogs
WHERE UserId IN (SELECT UserId FROM #SeedAccountsToReplace)
   OR Email IN (SELECT Email FROM #SeedUsersFullAuth)
   OR Email LIKE N'user%@demo.local';

DELETE FROM dbo.Auth_OutboxEvents
WHERE AggregateId IN (SELECT UserId FROM #SeedAccountsToReplace)
   OR TraceId LIKE N'trace-auth-tdmu-%'
   OR TraceId LIKE N'trace-auth-extra-%';

DELETE FROM dbo.Auth_Accounts
WHERE UserId IN (SELECT UserId FROM #SeedAccountsToReplace);

/* ---------------------------------------------------------
   1) Auth_Accounts: 55 rows
   --------------------------------------------------------- */
;WITH S AS
(
    SELECT
        u.UserNo,
        u.UserId,
        u.Email,
        u.FullName,
        u.StudentCode,
        u.RoleName,
        N'Tdmu@123456' AS Pwd,
        CASE
            WHEN u.UserNo IN (18, 36, 54) THEN CAST(3 AS TINYINT) -- suspended/locked sample
            WHEN u.UserNo % 10 = 0 THEN CAST(2 AS TINYINT)        -- pending/inactive sample
            ELSE CAST(1 AS TINYINT)                              -- active
        END AS Status,
        CASE
            WHEN u.Email LIKE N'%@student.tdmu.edu.vn' OR u.Email LIKE N'%@tdmu.edu.vn' THEN CAST(1 AS BIT)
            WHEN u.UserNo % 4 IN (0, 1, 2) THEN CAST(1 AS BIT)
            ELSE CAST(0 AS BIT)
        END AS IsEmailVerified,
        DATEADD(DAY, u.UserNo - 1, CAST('2026-01-10T08:00:00' AS DATETIME2(7))) AS CreatedAt,
        DATEADD(DAY, u.UserNo + 1, CAST('2026-01-10T08:00:00' AS DATETIME2(7))) AS UpdatedAt
    FROM #SeedUsersFullAuth u
)
INSERT INTO dbo.Auth_Accounts
(UserId, Email, PasswordHash, PasswordAlgo, IsEmailVerified, Status, CreatedAt, UpdatedAt)
SELECT
    s.UserId,
    s.Email,
    HASHBYTES('SHA2_512', CONVERT(VARBINARY(MAX), s.Pwd)) AS PasswordHash,
    N'SHA2_512',
    s.IsEmailVerified,
    s.Status,
    s.CreatedAt,
    s.UpdatedAt
FROM S s;

/* ---------------------------------------------------------
   2) Auth_UserRoles: 55 rows
   RoleName chỉ dùng các role đang có trong init.sql: admin/moderator/user
   --------------------------------------------------------- */
INSERT INTO dbo.Auth_UserRoles(UserId, RoleId, AssignedAt)
SELECT
    u.UserId,
    r.RoleId,
    DATEADD(DAY, u.UserNo - 1, CAST('2026-01-12T09:00:00' AS DATETIME2(7))) AS AssignedAt
FROM #SeedUsersFullAuth u
INNER JOIN dbo.Auth_Roles r ON r.Name = u.RoleName;

/* ---------------------------------------------------------
   3) Auth_RefreshTokens: 55 rows
   --------------------------------------------------------- */
;WITH RT AS
(
    SELECT
        u.UserNo,
        CONVERT(UNIQUEIDENTIFIER,
            CONCAT(
                RIGHT(CONCAT('20000000', CONVERT(VARCHAR(8), u.UserNo)), 8),
                '-1111-2222-3333-',
                RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), u.UserNo)), 12)
            )
        ) AS TokenId,
        u.UserId,
        CONCAT(N'rt-tdmu-', ISNULL(u.StudentCode, N'staff'), N'-', u.UserNo, N'-seed') AS RawToken,
        DATEADD(HOUR, u.UserNo - 1, CAST('2026-02-01T09:00:00' AS DATETIME2(7))) AS IssuedAt,
        CASE
            WHEN u.UserNo % 10 = 0 THEN 30
            WHEN u.UserNo % 7  = 0 THEN 7
            ELSE 14
        END AS ExpDays,
        CONCAT(N'tdmu-web-', RIGHT(CONCAT('00', CONVERT(VARCHAR(3), u.UserNo)), 3)) AS DeviceId,
        CONCAT(N'10.20.', (u.UserNo / 10) + 1, N'.', (u.UserNo % 10) + 20) AS IpAddress,
        CASE
            WHEN u.UserNo % 3 = 0 THEN N'Firefox/126'
            WHEN u.UserNo % 3 = 1 THEN N'Chrome/124'
            ELSE N'Edge/124'
        END AS UserAgent
    FROM #SeedUsersFullAuth u
), RT2 AS
(
    SELECT
        rt.TokenId,
        rt.UserId,
        rt.RawToken,
        rt.IssuedAt,
        DATEADD(DAY, rt.ExpDays, rt.IssuedAt) AS ExpiresAt,
        CASE
            WHEN rt.UserNo IN (18, 36, 54) THEN DATEADD(HOUR, 6, rt.IssuedAt)
            WHEN rt.UserNo % 13 = 0 THEN DATEADD(HOUR, 12, rt.IssuedAt)
            ELSE NULL
        END AS RevokedAt,
        NULL AS ReplacedByTokenId,
        rt.DeviceId,
        rt.IpAddress,
        rt.UserAgent
    FROM RT rt
)
INSERT INTO dbo.Auth_RefreshTokens
(TokenId, UserId, TokenHash, IssuedAt, ExpiresAt, RevokedAt, ReplacedByTokenId, DeviceId, IpAddress, UserAgent)
SELECT
    rt2.TokenId,
    rt2.UserId,
    CONVERT(BINARY(32), HASHBYTES('SHA2_256', CONVERT(VARBINARY(MAX), rt2.RawToken))),
    rt2.IssuedAt,
    rt2.ExpiresAt,
    rt2.RevokedAt,
    rt2.ReplacedByTokenId,
    rt2.DeviceId,
    rt2.IpAddress,
    rt2.UserAgent
FROM RT2 rt2;

/* ---------------------------------------------------------
   4) Auth_LoginAuditLogs: 55 rows
   --------------------------------------------------------- */
;WITH L AS
(
    SELECT
        u.UserId,
        u.Email,
        CASE
            WHEN u.UserNo IN (18, 36, 54) THEN CAST(0 AS BIT)
            WHEN u.UserNo % 11 = 0 THEN CAST(0 AS BIT)
            ELSE CAST(1 AS BIT)
        END AS Success,
        CASE
            WHEN u.UserNo IN (18, 36, 54) THEN N'AccountSuspended'
            WHEN u.UserNo % 11 = 0 THEN N'InvalidPassword'
            ELSE NULL
        END AS FailureReason,
        CONCAT(N'172.20.', (u.UserNo / 10) + 10, N'.', (u.UserNo % 10) + 30) AS IpAddress,
        CASE
            WHEN u.UserNo % 4 = 0 THEN N'PostmanRuntime/7.43.0'
            ELSE N'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        END AS UserAgent,
        DATEADD(MINUTE, (u.UserNo - 1) * 11, CAST('2026-03-01T07:00:00' AS DATETIME2(7))) AS CreatedAt
    FROM #SeedUsersFullAuth u
)
INSERT INTO dbo.Auth_LoginAuditLogs
(UserId, Email, Success, FailureReason, IpAddress, UserAgent, CreatedAt)
SELECT
    l.UserId,
    l.Email,
    l.Success,
    l.FailureReason,
    l.IpAddress,
    l.UserAgent,
    l.CreatedAt
FROM L l;

/* ---------------------------------------------------------
   5) Auth_OutboxEvents: 55 rows
   PayloadJson giữ thêm fullName/studentCode/role vì bảng Auth_Accounts không có các cột này
   --------------------------------------------------------- */
;WITH E AS
(
    SELECT
        CONVERT(UNIQUEIDENTIFIER,
            CONCAT(
                RIGHT(CONCAT('30000000', CONVERT(VARCHAR(8), u.UserNo)), 8),
                '-4444-5555-6666-',
                RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), u.UserNo)), 12)
            )
        ) AS EventId,
        u.UserId AS AggregateId,
        CASE
            WHEN u.UserNo IN (18, 36, 54) THEN N'Auth.AccountSuspended'
            WHEN u.UserNo % 10 = 0 THEN N'Auth.AccountPendingReview'
            WHEN u.UserNo % 4  = 3 THEN N'Auth.EmailVerificationRequested'
            ELSE N'Auth.AccountCreated'
        END AS EventType,
        CONCAT(
            N'{"userId":"', CONVERT(NVARCHAR(36), u.UserId),
            N'","email":"', u.Email,
            N'","fullName":"', u.FullName,
            N'","studentCode":',
                CASE WHEN u.StudentCode IS NULL THEN N'null' ELSE CONCAT(N'"', u.StudentCode, N'"') END,
            N',"role":"', u.RoleName,
            N'"}'
        ) AS PayloadJson,
        DATEADD(MINUTE, (u.UserNo - 1) * 9, CAST('2026-02-15T06:00:00' AS DATETIME2(7))) AS OccurredAt,
        CASE
            WHEN u.UserNo % 5 = 0 THEN DATEADD(MINUTE, (u.UserNo - 1) * 9 + 3, CAST('2026-02-15T06:00:00' AS DATETIME2(7)))
            ELSE NULL
        END AS ProcessedAt,
        CONCAT(N'trace-auth-tdmu-', RIGHT(CONCAT('000', CONVERT(VARCHAR(3), u.UserNo)), 3)) AS TraceId
    FROM #SeedUsersFullAuth u
)
INSERT INTO dbo.Auth_OutboxEvents
(EventId, AggregateId, EventType, PayloadJson, OccurredAt, ProcessedAt, TraceId)
SELECT
    e.EventId,
    e.AggregateId,
    e.EventType,
    e.PayloadJson,
    e.OccurredAt,
    e.ProcessedAt,
    e.TraceId
FROM E e;

DROP TABLE #SeedAccountsToReplace;
DROP TABLE #SeedUsersFullAuth;
GO

/* Kiểm tra nhanh sau khi chạy:
SELECT COUNT(*) AS TotalAccounts FROM dbo.Auth_Accounts;
SELECT TOP 10 Email, PasswordAlgo, Status, IsEmailVerified FROM dbo.Auth_Accounts ORDER BY CreatedAt;
SELECT r.Name, COUNT(*) AS TotalUsers
FROM dbo.Auth_UserRoles ur
INNER JOIN dbo.Auth_Roles r ON r.RoleId = ur.RoleId
GROUP BY r.Name;
*/
