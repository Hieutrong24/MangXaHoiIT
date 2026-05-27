USE UserDB;
GO

SET NOCOUNT ON;

/* =========================================================
   USER-SERVICE SEED DATA - TDMU REALISTIC SAMPLE
   Tương ứng với auth_service_seed_full_55_tdmu_real.sql

   Ghi chú:
   - Giữ nguyên UserId, FullName, Email/MSSV theo seed AuthDB.
   - Bảng dbo.Users bắt buộc StudentCode NOT NULL, nên tài khoản cán bộ
     dùng mã dạng CB2026xxx để không lỗi ràng buộc.
   - Dữ liệu là mẫu mô phỏng thật hơn cho môi trường dev/demo:
     hồ sơ sinh viên/cán bộ, kỹ năng, học vấn, kinh nghiệm, chứng chỉ,
     dự án portfolio, CV, highlights, follow/friend request/block và outbox.
   ========================================================= */

IF OBJECT_ID('tempdb..#SeedUserProfiles') IS NOT NULL DROP TABLE #SeedUserProfiles;

CREATE TABLE #SeedUserProfiles
(
    UserNo             TINYINT          NOT NULL PRIMARY KEY,
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
    OpenToInternship   BIT              NOT NULL,
    OpenToJob          BIT              NOT NULL,
    OpenToCollab       BIT              NOT NULL,
    PreferredJobTitle  NVARCHAR(120)    NULL,
    PreferredLocation  NVARCHAR(150)    NULL,
    ContributionScore  INT              NOT NULL,
    FollowersCount     INT              NOT NULL,
    FollowingCount     INT              NOT NULL,
    PublicRepoCount    INT              NOT NULL,
    PinnedProjectCount INT              NOT NULL,
    ProfileCompletion  TINYINT          NOT NULL,
    LastProfileSyncAt  DATETIME2(7)     NULL,
    Status             TINYINT          NOT NULL,
    CreatedAt          DATETIME2(7)     NOT NULL,
    UpdatedAt          DATETIME2(7)     NOT NULL,
    RoleName           NVARCHAR(50)     NOT NULL
);

INSERT INTO #SeedUserProfiles
(UserNo, UserId, StudentCode, Username, FullName, TDMUEmail, Department, Major, ClassName, EnrollmentYear, AvatarUrl, CoverUrl, Bio, Headline, Location, WebsiteUrl, GithubUrl, LinkedInUrl, PortfolioUrl, PhoneNumber, DateOfBirth, Gender, CurrentYear, GPA, CareerGoal, OpenToInternship, OpenToJob, OpenToCollab, PreferredJobTitle, PreferredLocation, ContributionScore, FollowersCount, FollowingCount, PublicRepoCount, PinnedProjectCount, ProfileCompletion, LastProfileSyncAt, Status, CreatedAt, UpdatedAt, RoleName)
VALUES
(1, '10000001-aaaa-bbbb-cccc-000000000001', N'2023201001', N'nguyenvanan_001', N'Nguyễn Văn An', N'2023201001@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/nguyenvanan_001.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/nguyenvanan_001', N'https://github.com/nguyenvanan_001', N'https://www.linkedin.com/in/nguyenvanan_001', N'https://portfolio.tdmu.dev/nguyenvanan_001', N'0910000001', '2004-02-03', 1, 3, 2.82, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 65, 1, 1, 1, 1, 73, N'2026-04-02T08:03:00', 1, N'2026-01-02T08:02:00', N'2026-04-02T09:04:00', N'user'),
(2, '10000002-aaaa-bbbb-cccc-000000000002', N'2023201002', N'tranthibaoanh_002', N'Trần Thị Bảo Anh', N'2023201002@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/tranthibaoanh_002.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/tranthibaoanh_002', N'https://github.com/tranthibaoanh_002', N'https://www.linkedin.com/in/tranthibaoanh_002', N'https://portfolio.tdmu.dev/tranthibaoanh_002', N'0910000002', '2003-03-05', 2, 3, 2.89, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 80, 1, 1, 1, 1, 76, N'2026-04-03T08:06:00', 1, N'2026-01-03T08:04:00', N'2026-04-03T09:08:00', N'user'),
(3, '10000003-aaaa-bbbb-cccc-000000000003', N'2023201003', N'leminhduc_003', N'Lê Minh Đức', N'2023201003@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/leminhduc_003.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/leminhduc_003', N'https://github.com/leminhduc_003', N'https://www.linkedin.com/in/leminhduc_003', N'https://portfolio.tdmu.dev/leminhduc_003', N'0910000003', '2005-04-07', 1, 3, 2.96, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 95, 1, 1, 1, 1, 79, N'2026-04-04T08:09:00', 1, N'2026-01-04T08:06:00', N'2026-04-04T09:12:00', N'user'),
(4, '10000004-aaaa-bbbb-cccc-000000000004', N'2023201004', N'phamngochan_004', N'Phạm Ngọc Hân', N'2023201004@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/phamngochan_004.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/phamngochan_004', N'https://github.com/phamngochan_004', N'https://www.linkedin.com/in/phamngochan_004', N'https://portfolio.tdmu.dev/phamngochan_004', N'0910000004', '2004-05-09', 2, 3, 3.03, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 110, 1, 1, 1, 1, 82, N'2026-04-05T08:12:00', 1, N'2026-01-05T08:08:00', N'2026-04-05T09:16:00', N'user'),
(5, '10000005-aaaa-bbbb-cccc-000000000005', N'2023201005', N'huynhgiabao_005', N'Huỳnh Gia Bảo', N'2023201005@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/huynhgiabao_005.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/huynhgiabao_005', N'https://github.com/huynhgiabao_005', N'https://www.linkedin.com/in/huynhgiabao_005', N'https://portfolio.tdmu.dev/huynhgiabao_005', N'0910000005', '2003-06-11', 1, 3, 3.10, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 125, 1, 1, 1, 1, 85, N'2026-04-06T08:15:00', 1, N'2026-01-06T08:10:00', N'2026-04-06T09:20:00', N'user'),
(6, '10000006-aaaa-bbbb-cccc-000000000006', N'2023201006', N'vothithanhtruc_006', N'Võ Thị Thanh Trúc', N'2023201006@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/vothithanhtruc_006.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/vothithanhtruc_006', N'https://github.com/vothithanhtruc_006', N'https://www.linkedin.com/in/vothithanhtruc_006', N'https://portfolio.tdmu.dev/vothithanhtruc_006', N'0910000006', '2005-07-13', 2, 3, 3.17, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 140, 1, 1, 1, 1, 88, N'2026-04-07T08:18:00', 1, N'2026-01-07T08:12:00', N'2026-04-07T09:24:00', N'user'),
(7, '10000007-aaaa-bbbb-cccc-000000000007', N'2023201007', N'dangquochuy_007', N'Đặng Quốc Huy', N'2023201007@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/dangquochuy_007.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/dangquochuy_007', N'https://github.com/dangquochuy_007', N'https://www.linkedin.com/in/dangquochuy_007', N'https://portfolio.tdmu.dev/dangquochuy_007', N'0910000007', '2004-08-15', 1, 3, 3.24, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 92, 1, 1, 1, 1, 91, N'2026-04-08T08:21:00', 1, N'2026-01-08T08:14:00', N'2026-04-08T09:28:00', N'user'),
(8, '10000008-aaaa-bbbb-cccc-000000000008', N'2023201008', N'buiphuonglinh_008', N'Bùi Phương Linh', N'2023201008@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/buiphuonglinh_008.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/buiphuonglinh_008', N'https://github.com/buiphuonglinh_008', N'https://www.linkedin.com/in/buiphuonglinh_008', N'https://portfolio.tdmu.dev/buiphuonglinh_008', N'0910000008', '2003-09-17', 2, 3, 3.31, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 107, 1, 1, 1, 1, 94, N'2026-04-09T08:24:00', 1, N'2026-01-09T08:16:00', N'2026-04-09T09:32:00', N'user'),
(9, '10000009-aaaa-bbbb-cccc-000000000009', N'2023201009', N'ngohoangnam_009', N'Ngô Hoàng Nam', N'2023201009@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/ngohoangnam_009.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/ngohoangnam_009', N'https://github.com/ngohoangnam_009', N'https://www.linkedin.com/in/ngohoangnam_009', N'https://portfolio.tdmu.dev/ngohoangnam_009', N'0910000009', '2005-10-19', 1, 3, 3.38, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 122, 1, 1, 1, 1, 97, N'2026-04-10T08:27:00', 1, N'2026-01-10T08:18:00', N'2026-04-10T09:36:00', N'user'),
(10, '10000010-aaaa-bbbb-cccc-000000000010', N'2023201010', N'dothuyduong_010', N'Đỗ Thùy Dương', N'2023201010@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/dothuyduong_010.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/dothuyduong_010', N'https://github.com/dothuyduong_010', N'https://www.linkedin.com/in/dothuyduong_010', N'https://portfolio.tdmu.dev/dothuyduong_010', N'0910000010', '2004-11-21', 2, 3, 3.45, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 137, 1, 1, 1, 1, 71, N'2026-04-11T08:30:00', 2, N'2026-01-11T08:20:00', N'2026-04-11T09:40:00', N'user'),
(11, '10000011-aaaa-bbbb-cccc-000000000011', N'2023201011', N'nguyenminhkhang_011', N'Nguyễn Minh Khang', N'2023201011@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/nguyenminhkhang_011.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/nguyenminhkhang_011', N'https://github.com/nguyenminhkhang_011', N'https://www.linkedin.com/in/nguyenminhkhang_011', N'https://portfolio.tdmu.dev/nguyenminhkhang_011', N'0910000011', '2003-12-23', 1, 3, 3.52, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 152, 1, 1, 1, 1, 74, N'2026-04-12T08:33:00', 1, N'2026-01-12T08:22:00', N'2026-04-12T09:44:00', N'user'),
(12, '10000012-aaaa-bbbb-cccc-000000000012', N'2023201012', N'trangiahan_012', N'Trần Gia Hân', N'2023201012@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Kỹ thuật phần mềm', N'D23PM01', 2023, N'https://cdn.tdmu.dev/avatars/trangiahan_012.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Yêu thích xây dựng ứng dụng web, thiết kế API rõ ràng và triển khai sản phẩm có ích cho cộng đồng sinh viên.', N'Sinh viên kỹ thuật phần mềm định hướng phát triển web và API', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/trangiahan_012', N'https://github.com/trangiahan_012', N'https://www.linkedin.com/in/trangiahan_012', N'https://portfolio.tdmu.dev/trangiahan_012', N'0910000012', '2005-01-25', 2, 3, 3.59, N'Trở thành lập trình viên full-stack có khả năng phát triển sản phẩm giáo dục và dịch vụ sinh viên.', 1, 0, 1, N'Thực tập sinh lập trình .NET', N'Bình Dương hoặc TP. Hồ Chí Minh', 167, 1, 1, 1, 1, 77, N'2026-04-13T08:36:00', 1, N'2026-01-13T08:24:00', N'2026-04-13T09:48:00', N'user'),
(13, '10000013-aaaa-bbbb-cccc-000000000013', N'2023201013', N'leanhtuan_013', N'Lê Anh Tuấn', N'2023201013@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/leanhtuan_013.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/leanhtuan_013', N'https://github.com/leanhtuan_013', N'https://www.linkedin.com/in/leanhtuan_013', N'https://portfolio.tdmu.dev/leanhtuan_013', N'0910000013', '2004-02-27', 1, 3, 3.66, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 182, 1, 1, 1, 1, 80, N'2026-04-14T08:39:00', 1, N'2026-01-14T08:26:00', N'2026-04-14T09:52:00', N'user'),
(14, '10000014-aaaa-bbbb-cccc-000000000014', N'2023201014', N'phamkhanhvy_014', N'Phạm Khánh Vy', N'2023201014@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/phamkhanhvy_014.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/phamkhanhvy_014', N'https://github.com/phamkhanhvy_014', N'https://www.linkedin.com/in/phamkhanhvy_014', N'https://portfolio.tdmu.dev/phamkhanhvy_014', N'0910000014', '2003-03-02', 1, 3, 3.73, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 134, 1, 1, 1, 1, 83, N'2026-04-15T08:42:00', 1, N'2026-01-15T08:28:00', N'2026-04-15T09:56:00', N'user'),
(15, '10000015-aaaa-bbbb-cccc-000000000015', N'2023201015', N'huynhnhatminh_015', N'Huỳnh Nhật Minh', N'2023201015@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/huynhnhatminh_015.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/huynhnhatminh_015', N'https://github.com/huynhnhatminh_015', N'https://www.linkedin.com/in/huynhnhatminh_015', N'https://portfolio.tdmu.dev/huynhnhatminh_015', N'0910000015', '2005-04-04', 1, 3, 3.80, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 149, 1, 1, 1, 1, 86, N'2026-04-16T08:45:00', 1, N'2026-01-16T08:30:00', N'2026-04-16T09:00:00', N'user'),
(16, '10000016-aaaa-bbbb-cccc-000000000016', N'2023201016', N'vohoangphuc_016', N'Võ Hoàng Phúc', N'2023201016@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/vohoangphuc_016.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/vohoangphuc_016', N'https://github.com/vohoangphuc_016', N'https://www.linkedin.com/in/vohoangphuc_016', N'https://portfolio.tdmu.dev/vohoangphuc_016', N'0910000016', '2004-05-06', 1, 3, 2.77, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 164, 1, 1, 1, 1, 89, N'2026-04-17T08:48:00', 1, N'2026-01-17T08:32:00', N'2026-04-17T09:04:00', N'user'),
(17, '10000017-aaaa-bbbb-cccc-000000000017', N'2023201017', N'dangthaonguyen_017', N'Đặng Thảo Nguyên', N'2023201017@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/dangthaonguyen_017.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/dangthaonguyen_017', N'https://github.com/dangthaonguyen_017', N'https://www.linkedin.com/in/dangthaonguyen_017', N'https://portfolio.tdmu.dev/dangthaonguyen_017', N'0910000017', '2003-06-08', 2, 3, 2.84, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 179, 1, 1, 1, 1, 92, N'2026-04-18T08:51:00', 1, N'2026-01-18T08:34:00', N'2026-04-18T09:08:00', N'user'),
(18, '10000018-aaaa-bbbb-cccc-000000000018', N'2023201018', N'buiducanh_018', N'Bùi Đức Anh', N'2023201018@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/buiducanh_018.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/buiducanh_018', N'https://github.com/buiducanh_018', N'https://www.linkedin.com/in/buiducanh_018', N'https://portfolio.tdmu.dev/buiducanh_018', N'0910000018', '2005-07-10', 2, 3, 2.91, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 194, 1, 1, 1, 1, 95, N'2026-04-19T08:54:00', 3, N'2026-01-19T08:36:00', N'2026-04-19T09:12:00', N'user'),
(19, '10000019-aaaa-bbbb-cccc-000000000019', N'2023201019', N'ngomyduyen_019', N'Ngô Mỹ Duyên', N'2023201019@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/ngomyduyen_019.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/ngomyduyen_019', N'https://github.com/ngomyduyen_019', N'https://www.linkedin.com/in/ngomyduyen_019', N'https://portfolio.tdmu.dev/ngomyduyen_019', N'0910000019', '2004-08-12', 2, 3, 2.98, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 209, 1, 1, 1, 1, 98, N'2026-04-20T08:57:00', 1, N'2026-01-20T08:38:00', N'2026-04-20T09:16:00', N'user'),
(20, '10000020-aaaa-bbbb-cccc-000000000020', N'2023201020', N'doquanghung_020', N'Đỗ Quang Hưng', N'2023201020@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/doquanghung_020.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/doquanghung_020', N'https://github.com/doquanghung_020', N'https://www.linkedin.com/in/doquanghung_020', N'https://portfolio.tdmu.dev/doquanghung_020', N'0910000020', '2003-09-14', 1, 3, 3.05, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 224, 1, 1, 1, 1, 72, N'2026-04-01T08:00:00', 2, N'2026-01-01T08:40:00', N'2026-04-21T09:20:00', N'user'),
(21, '10000021-aaaa-bbbb-cccc-000000000021', N'2023201021', N'nguyenkimngan_021', N'Nguyễn Kim Ngân', N'2023201021@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/nguyenkimngan_021.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/nguyenkimngan_021', N'https://github.com/nguyenkimngan_021', N'https://www.linkedin.com/in/nguyenkimngan_021', N'https://portfolio.tdmu.dev/nguyenkimngan_021', N'0910000021', '2005-10-16', 2, 3, 3.12, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 176, 1, 1, 1, 1, 75, N'2026-04-02T08:03:00', 1, N'2026-01-02T08:42:00', N'2026-04-22T09:24:00', N'user'),
(22, '10000022-aaaa-bbbb-cccc-000000000022', N'2023201022', N'tranminhquan_022', N'Trần Minh Quân', N'2023201022@student.tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Hệ thống thông tin', N'D23HTTT01', 2023, N'https://cdn.tdmu.dev/avatars/tranminhquan_022.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Tập trung vào phân tích yêu cầu, cơ sở dữ liệu, dashboard và tối ưu quy trình vận hành trong trường học.', N'Sinh viên hệ thống thông tin quan tâm phân tích nghiệp vụ và dữ liệu', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/tranminhquan_022', N'https://github.com/tranminhquan_022', N'https://www.linkedin.com/in/tranminhquan_022', N'https://portfolio.tdmu.dev/tranminhquan_022', N'0910000022', '2004-11-18', 1, 3, 3.19, N'Phát triển năng lực Business Analyst và Data Analyst cho các hệ thống quản lý giáo dục.', 1, 0, 1, N'Thực tập sinh phân tích nghiệp vụ', N'Bình Dương hoặc TP. Hồ Chí Minh', 191, 1, 1, 1, 1, 78, N'2026-04-03T08:06:00', 1, N'2026-01-03T08:44:00', N'2026-04-23T09:28:00', N'user'),
(23, '10000023-aaaa-bbbb-cccc-000000000023', N'2023201023', N'lebaongoc_023', N'Lê Bảo Ngọc', N'2023201023@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/lebaongoc_023.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/lebaongoc_023', N'https://github.com/lebaongoc_023', N'https://www.linkedin.com/in/lebaongoc_023', N'https://portfolio.tdmu.dev/lebaongoc_023', N'0910000023', '2003-12-20', 2, 3, 3.26, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 0, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 206, 1, 1, 1, 1, 81, N'2026-04-04T08:09:00', 1, N'2026-01-04T08:46:00', N'2026-04-24T09:32:00', N'user'),
(24, '10000024-aaaa-bbbb-cccc-000000000024', N'2023201024', N'phamthanhdat_024', N'Phạm Thành Đạt', N'2023201024@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/phamthanhdat_024.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/phamthanhdat_024', N'https://github.com/phamthanhdat_024', N'https://www.linkedin.com/in/phamthanhdat_024', N'https://portfolio.tdmu.dev/phamthanhdat_024', N'0910000024', '2005-01-22', 1, 3, 3.33, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 0, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 221, 1, 1, 1, 1, 84, N'2026-04-05T08:12:00', 1, N'2026-01-05T08:48:00', N'2026-04-01T09:36:00', N'user'),
(25, '10000025-aaaa-bbbb-cccc-000000000025', N'2023201025', N'huynhnhuy_025', N'Huỳnh Như Ý', N'2023201025@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/huynhnhuy_025.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/huynhnhuy_025', N'https://github.com/huynhnhuy_025', N'https://www.linkedin.com/in/huynhnhuy_025', N'https://portfolio.tdmu.dev/huynhnhuy_025', N'0910000025', '2004-02-24', 1, 3, 3.40, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 0, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 236, 1, 1, 1, 1, 87, N'2026-04-06T08:15:00', 1, N'2026-01-06T08:50:00', N'2026-04-02T09:40:00', N'user'),
(26, '10000026-aaaa-bbbb-cccc-000000000026', N'2023201026', N'vominhtriet_026', N'Võ Minh Triết', N'2023201026@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/vominhtriet_026.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/vominhtriet_026', N'https://github.com/vominhtriet_026', N'https://www.linkedin.com/in/vominhtriet_026', N'https://portfolio.tdmu.dev/vominhtriet_026', N'0910000026', '2003-03-26', 1, 3, 3.47, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 0, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 251, 1, 1, 1, 1, 90, N'2026-04-07T08:18:00', 1, N'2026-01-07T08:52:00', N'2026-04-03T09:44:00', N'user'),
(27, '10000027-aaaa-bbbb-cccc-000000000027', N'2023201027', N'danghaiyen_027', N'Đặng Hải Yến', N'2023201027@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/danghaiyen_027.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/danghaiyen_027', N'https://github.com/danghaiyen_027', N'https://www.linkedin.com/in/danghaiyen_027', N'https://portfolio.tdmu.dev/danghaiyen_027', N'0910000027', '2005-04-01', 2, 3, 3.54, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 0, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 266, 1, 1, 1, 1, 93, N'2026-04-08T08:21:00', 1, N'2026-01-08T08:54:00', N'2026-04-04T09:48:00', N'user'),
(28, '10000028-aaaa-bbbb-cccc-000000000028', N'2023201028', N'buithanhtam_028', N'Bùi Thanh Tâm', N'2023201028@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/buithanhtam_028.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/buithanhtam_028', N'https://github.com/buithanhtam_028', N'https://www.linkedin.com/in/buithanhtam_028', N'https://portfolio.tdmu.dev/buithanhtam_028', N'0910000028', '2004-05-03', 2, 3, 3.61, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 0, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 218, 1, 1, 1, 1, 96, N'2026-04-09T08:24:00', 1, N'2026-01-09T08:56:00', N'2026-04-05T09:52:00', N'user'),
(29, '10000029-aaaa-bbbb-cccc-000000000029', N'2023201029', N'ngoducduy_029', N'Ngô Đức Duy', N'2023201029@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/ngoducduy_029.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/ngoducduy_029', N'https://github.com/ngoducduy_029', N'https://www.linkedin.com/in/ngoducduy_029', N'https://portfolio.tdmu.dev/ngoducduy_029', N'0910000029', '2003-06-05', 1, 3, 3.68, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 0, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 233, 1, 1, 1, 1, 70, N'2026-04-10T08:27:00', 1, N'2026-01-10T08:58:00', N'2026-04-06T09:56:00', N'user'),
(30, '10000030-aaaa-bbbb-cccc-000000000030', N'2023201030', N'dohamy_030', N'Đỗ Hà My', N'2023201030@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/dohamy_030.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/dohamy_030', N'https://github.com/dohamy_030', N'https://www.linkedin.com/in/dohamy_030', N'https://portfolio.tdmu.dev/dohamy_030', N'0910000030', '2005-07-07', 2, 3, 3.75, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 1, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 248, 1, 1, 1, 1, 73, N'2026-04-11T08:30:00', 2, N'2026-01-11T08:00:00', N'2026-04-07T09:00:00', N'user'),
(31, '10000031-aaaa-bbbb-cccc-000000000031', N'2023201031', N'nguyentanphat_031', N'Nguyễn Tấn Phát', N'2023201031@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/nguyentanphat_031.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/nguyentanphat_031', N'https://github.com/nguyentanphat_031', N'https://www.linkedin.com/in/nguyentanphat_031', N'https://portfolio.tdmu.dev/nguyentanphat_031', N'0910000031', '2004-08-09', 1, 3, 3.82, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 1, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 263, 1, 1, 1, 1, 76, N'2026-04-12T08:33:00', 1, N'2026-01-12T08:02:00', N'2026-04-08T09:04:00', N'user'),
(32, '10000032-aaaa-bbbb-cccc-000000000032', N'2023201032', N'tranngocmai_032', N'Trần Ngọc Mai', N'2023201032@student.tdmu.edu.vn', N'Khoa Kinh tế', N'Quản trị kinh doanh', N'D23QTKD01', 2023, N'https://cdn.tdmu.dev/avatars/tranngocmai_032.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Quan tâm đến nghiên cứu thị trường, hành vi người dùng và phát triển nội dung truyền thông cho sản phẩm trẻ.', N'Sinh viên quản trị kinh doanh yêu thích marketing số và khởi nghiệp', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/tranngocmai_032', N'https://github.com/tranngocmai_032', N'https://www.linkedin.com/in/tranngocmai_032', N'https://portfolio.tdmu.dev/tranngocmai_032', N'0910000032', '2003-09-11', 2, 3, 2.79, N'Tham gia dự án marketing số và xây dựng kỹ năng quản lý sản phẩm ở môi trường thực tế.', 1, 1, 1, N'Thực tập sinh Digital Marketing', N'Bình Dương hoặc TP. Hồ Chí Minh', 278, 1, 1, 1, 1, 79, N'2026-04-13T08:36:00', 1, N'2026-01-13T08:04:00', N'2026-04-09T09:08:00', N'user'),
(33, '10000033-aaaa-bbbb-cccc-000000000033', N'2023201033', N'lehoanglong_033', N'Lê Hoàng Long', N'2023201033@student.tdmu.edu.vn', N'Khoa Kiến trúc - Mỹ thuật ứng dụng', N'Thiết kế đồ họa', N'D23TKDH01', 2023, N'https://cdn.tdmu.dev/avatars/lehoanglong_033.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Quan tâm đến thiết kế thương hiệu, minh họa số và trải nghiệm người dùng trong các sản phẩm giáo dục.', N'Sinh viên thiết kế đồ họa yêu thích nhận diện thương hiệu và UI/UX', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/lehoanglong_033', N'https://github.com/lehoanglong_033', N'https://www.linkedin.com/in/lehoanglong_033', N'https://portfolio.tdmu.dev/lehoanglong_033', N'0910000033', '2005-10-13', 1, 3, 2.86, N'Xây dựng portfolio thiết kế chuyên nghiệp và tham gia các dự án truyền thông số cho sinh viên TDMU.', 1, 1, 1, N'Thực tập sinh thiết kế UI/UX', N'Bình Dương hoặc TP. Hồ Chí Minh', 293, 1, 1, 1, 1, 82, N'2026-04-14T08:39:00', 1, N'2026-01-14T08:06:00', N'2026-04-10T09:12:00', N'user'),
(34, '10000034-aaaa-bbbb-cccc-000000000034', N'2023201034', N'phamminhchau_034', N'Phạm Minh Châu', N'2023201034@student.tdmu.edu.vn', N'Khoa Kiến trúc - Mỹ thuật ứng dụng', N'Thiết kế đồ họa', N'D23TKDH01', 2023, N'https://cdn.tdmu.dev/avatars/phamminhchau_034.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Quan tâm đến thiết kế thương hiệu, minh họa số và trải nghiệm người dùng trong các sản phẩm giáo dục.', N'Sinh viên thiết kế đồ họa yêu thích nhận diện thương hiệu và UI/UX', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/phamminhchau_034', N'https://github.com/phamminhchau_034', N'https://www.linkedin.com/in/phamminhchau_034', N'https://portfolio.tdmu.dev/phamminhchau_034', N'0910000034', '2004-11-15', 2, 3, 2.93, N'Xây dựng portfolio thiết kế chuyên nghiệp và tham gia các dự án truyền thông số cho sinh viên TDMU.', 1, 1, 1, N'Thực tập sinh thiết kế UI/UX', N'Bình Dương hoặc TP. Hồ Chí Minh', 308, 1, 1, 1, 1, 85, N'2026-04-15T08:42:00', 1, N'2026-01-15T08:08:00', N'2026-04-11T09:16:00', N'user'),
(35, '10000035-aaaa-bbbb-cccc-000000000035', N'2023201035', N'huynhanhkhoa_035', N'Huỳnh Anh Khoa', N'2023201035@student.tdmu.edu.vn', N'Khoa Kiến trúc - Mỹ thuật ứng dụng', N'Thiết kế đồ họa', N'D23TKDH01', 2023, N'https://cdn.tdmu.dev/avatars/huynhanhkhoa_035.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Quan tâm đến thiết kế thương hiệu, minh họa số và trải nghiệm người dùng trong các sản phẩm giáo dục.', N'Sinh viên thiết kế đồ họa yêu thích nhận diện thương hiệu và UI/UX', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/huynhanhkhoa_035', N'https://github.com/huynhanhkhoa_035', N'https://www.linkedin.com/in/huynhanhkhoa_035', N'https://portfolio.tdmu.dev/huynhanhkhoa_035', N'0910000035', '2003-12-17', 1, 3, 3.00, N'Xây dựng portfolio thiết kế chuyên nghiệp và tham gia các dự án truyền thông số cho sinh viên TDMU.', 1, 1, 1, N'Thực tập sinh thiết kế UI/UX', N'Bình Dương hoặc TP. Hồ Chí Minh', 260, 1, 1, 1, 1, 88, N'2026-04-16T08:45:00', 1, N'2026-01-16T08:10:00', N'2026-04-12T09:20:00', N'user'),
(36, '10000036-aaaa-bbbb-cccc-000000000036', N'2023201036', N'vokhanhlinh_036', N'Võ Khánh Linh', N'2023201036@student.tdmu.edu.vn', N'Khoa Kiến trúc - Mỹ thuật ứng dụng', N'Thiết kế đồ họa', N'D23TKDH01', 2023, N'https://cdn.tdmu.dev/avatars/vokhanhlinh_036.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Quan tâm đến thiết kế thương hiệu, minh họa số và trải nghiệm người dùng trong các sản phẩm giáo dục.', N'Sinh viên thiết kế đồ họa yêu thích nhận diện thương hiệu và UI/UX', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/vokhanhlinh_036', N'https://github.com/vokhanhlinh_036', N'https://www.linkedin.com/in/vokhanhlinh_036', N'https://portfolio.tdmu.dev/vokhanhlinh_036', N'0910000036', '2005-01-19', 2, 3, 3.07, N'Xây dựng portfolio thiết kế chuyên nghiệp và tham gia các dự án truyền thông số cho sinh viên TDMU.', 1, 1, 1, N'Thực tập sinh thiết kế UI/UX', N'Bình Dương hoặc TP. Hồ Chí Minh', 275, 1, 1, 1, 1, 91, N'2026-04-17T08:48:00', 3, N'2026-01-17T08:12:00', N'2026-04-13T09:24:00', N'user'),
(37, '10000037-aaaa-bbbb-cccc-000000000037', N'2023201037', N'dangminhnhat_037', N'Đặng Minh Nhật', N'2023201037@student.tdmu.edu.vn', N'Khoa Kiến trúc - Mỹ thuật ứng dụng', N'Thiết kế đồ họa', N'D23TKDH01', 2023, N'https://cdn.tdmu.dev/avatars/dangminhnhat_037.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Quan tâm đến thiết kế thương hiệu, minh họa số và trải nghiệm người dùng trong các sản phẩm giáo dục.', N'Sinh viên thiết kế đồ họa yêu thích nhận diện thương hiệu và UI/UX', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/dangminhnhat_037', N'https://github.com/dangminhnhat_037', N'https://www.linkedin.com/in/dangminhnhat_037', N'https://portfolio.tdmu.dev/dangminhnhat_037', N'0910000037', '2004-02-21', 1, 3, 3.14, N'Xây dựng portfolio thiết kế chuyên nghiệp và tham gia các dự án truyền thông số cho sinh viên TDMU.', 1, 1, 1, N'Thực tập sinh thiết kế UI/UX', N'Bình Dương hoặc TP. Hồ Chí Minh', 290, 1, 1, 1, 1, 94, N'2026-04-18T08:51:00', 1, N'2026-01-18T08:14:00', N'2026-04-14T09:28:00', N'user'),
(38, '10000038-aaaa-bbbb-cccc-000000000038', N'2023201038', N'buigiahuy_038', N'Bùi Gia Huy', N'2023201038@student.tdmu.edu.vn', N'Khoa Kiến trúc - Mỹ thuật ứng dụng', N'Thiết kế đồ họa', N'D23TKDH01', 2023, N'https://cdn.tdmu.dev/avatars/buigiahuy_038.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Quan tâm đến thiết kế thương hiệu, minh họa số và trải nghiệm người dùng trong các sản phẩm giáo dục.', N'Sinh viên thiết kế đồ họa yêu thích nhận diện thương hiệu và UI/UX', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/buigiahuy_038', N'https://github.com/buigiahuy_038', N'https://www.linkedin.com/in/buigiahuy_038', N'https://portfolio.tdmu.dev/buigiahuy_038', N'0910000038', '2003-03-23', 1, 3, 3.21, N'Xây dựng portfolio thiết kế chuyên nghiệp và tham gia các dự án truyền thông số cho sinh viên TDMU.', 1, 1, 1, N'Thực tập sinh thiết kế UI/UX', N'Bình Dương hoặc TP. Hồ Chí Minh', 305, 1, 1, 1, 1, 97, N'2026-04-19T08:54:00', 1, N'2026-01-19T08:16:00', N'2026-04-15T09:32:00', N'user'),
(39, '10000039-aaaa-bbbb-cccc-000000000039', N'2023201039', N'ngothanhthao_039', N'Ngô Thanh Thảo', N'2023201039@student.tdmu.edu.vn', N'Khoa Kiến trúc - Mỹ thuật ứng dụng', N'Thiết kế đồ họa', N'D23TKDH01', 2023, N'https://cdn.tdmu.dev/avatars/ngothanhthao_039.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Quan tâm đến thiết kế thương hiệu, minh họa số và trải nghiệm người dùng trong các sản phẩm giáo dục.', N'Sinh viên thiết kế đồ họa yêu thích nhận diện thương hiệu và UI/UX', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/ngothanhthao_039', N'https://github.com/ngothanhthao_039', N'https://www.linkedin.com/in/ngothanhthao_039', N'https://portfolio.tdmu.dev/ngothanhthao_039', N'0910000039', '2005-04-25', 2, 3, 3.28, N'Xây dựng portfolio thiết kế chuyên nghiệp và tham gia các dự án truyền thông số cho sinh viên TDMU.', 1, 1, 1, N'Thực tập sinh thiết kế UI/UX', N'Bình Dương hoặc TP. Hồ Chí Minh', 320, 1, 1, 1, 1, 71, N'2026-04-20T08:57:00', 1, N'2026-01-20T08:18:00', N'2026-04-16T09:36:00', N'user'),
(40, '10000040-aaaa-bbbb-cccc-000000000040', N'2023201040', N'donhattan_040', N'Đỗ Nhật Tân', N'2023201040@student.tdmu.edu.vn', N'Khoa Kiến trúc - Mỹ thuật ứng dụng', N'Thiết kế đồ họa', N'D23TKDH01', 2023, N'https://cdn.tdmu.dev/avatars/donhattan_040.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Quan tâm đến thiết kế thương hiệu, minh họa số và trải nghiệm người dùng trong các sản phẩm giáo dục.', N'Sinh viên thiết kế đồ họa yêu thích nhận diện thương hiệu và UI/UX', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/donhattan_040', N'https://github.com/donhattan_040', N'https://www.linkedin.com/in/donhattan_040', N'https://portfolio.tdmu.dev/donhattan_040', N'0910000040', '2004-05-27', 1, 3, 3.35, N'Xây dựng portfolio thiết kế chuyên nghiệp và tham gia các dự án truyền thông số cho sinh viên TDMU.', 1, 1, 1, N'Thực tập sinh thiết kế UI/UX', N'Bình Dương hoặc TP. Hồ Chí Minh', 335, 1, 1, 1, 1, 74, N'2026-04-01T08:00:00', 2, N'2026-01-01T08:20:00', N'2026-04-17T09:40:00', N'user'),
(41, '10000041-aaaa-bbbb-cccc-000000000041', N'2023201041', N'nguyenphuonguyen_041', N'Nguyễn Phương Uyên', N'2023201041@student.tdmu.edu.vn', N'Khoa Ngoại ngữ', N'Ngôn ngữ Anh', N'D23NNA01', 2023, N'https://cdn.tdmu.dev/avatars/nguyenphuonguyen_041.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Mong muốn kết nối kỹ năng ngoại ngữ với truyền thông, dịch thuật và hỗ trợ sự kiện sinh viên.', N'Sinh viên ngôn ngữ Anh yêu thích truyền thông và biên tập nội dung', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/nguyenphuonguyen_041', N'https://github.com/nguyenphuonguyen_041', N'https://www.linkedin.com/in/nguyenphuonguyen_041', N'https://portfolio.tdmu.dev/nguyenphuonguyen_041', N'0910000041', '2003-06-02', 2, 3, 3.42, N'Phát triển năng lực truyền thông song ngữ và hỗ trợ các dự án hợp tác quốc tế.', 1, 1, 1, N'Cộng tác viên truyền thông song ngữ', N'Bình Dương hoặc TP. Hồ Chí Minh', 350, 1, 1, 1, 1, 77, N'2026-04-02T08:03:00', 1, N'2026-01-02T08:22:00', N'2026-04-18T09:44:00', N'user'),
(42, '10000042-aaaa-bbbb-cccc-000000000042', N'2023201042', N'tranducviet_042', N'Trần Đức Việt', N'2023201042@student.tdmu.edu.vn', N'Khoa Ngoại ngữ', N'Ngôn ngữ Anh', N'D23NNA01', 2023, N'https://cdn.tdmu.dev/avatars/tranducviet_042.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Mong muốn kết nối kỹ năng ngoại ngữ với truyền thông, dịch thuật và hỗ trợ sự kiện sinh viên.', N'Sinh viên ngôn ngữ Anh yêu thích truyền thông và biên tập nội dung', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/tranducviet_042', N'https://github.com/tranducviet_042', N'https://www.linkedin.com/in/tranducviet_042', N'https://portfolio.tdmu.dev/tranducviet_042', N'0910000042', '2005-07-04', 1, 3, 3.49, N'Phát triển năng lực truyền thông song ngữ và hỗ trợ các dự án hợp tác quốc tế.', 1, 1, 1, N'Cộng tác viên truyền thông song ngữ', N'Bình Dương hoặc TP. Hồ Chí Minh', 302, 1, 1, 1, 1, 80, N'2026-04-03T08:06:00', 1, N'2026-01-03T08:24:00', N'2026-04-19T09:48:00', N'user'),
(43, '10000043-aaaa-bbbb-cccc-000000000043', N'2023201043', N'lethuha_043', N'Lê Thu Hà', N'2023201043@student.tdmu.edu.vn', N'Khoa Ngoại ngữ', N'Ngôn ngữ Anh', N'D23NNA01', 2023, N'https://cdn.tdmu.dev/avatars/lethuha_043.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Mong muốn kết nối kỹ năng ngoại ngữ với truyền thông, dịch thuật và hỗ trợ sự kiện sinh viên.', N'Sinh viên ngôn ngữ Anh yêu thích truyền thông và biên tập nội dung', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/lethuha_043', N'https://github.com/lethuha_043', N'https://www.linkedin.com/in/lethuha_043', N'https://portfolio.tdmu.dev/lethuha_043', N'0910000043', '2004-08-06', 2, 3, 3.56, N'Phát triển năng lực truyền thông song ngữ và hỗ trợ các dự án hợp tác quốc tế.', 1, 1, 1, N'Cộng tác viên truyền thông song ngữ', N'Bình Dương hoặc TP. Hồ Chí Minh', 317, 1, 1, 1, 1, 83, N'2026-04-04T08:09:00', 1, N'2026-01-04T08:26:00', N'2026-04-20T09:52:00', N'user'),
(44, '10000044-aaaa-bbbb-cccc-000000000044', N'2023201044', N'phamgianghi_044', N'Phạm Gia Nghi', N'2023201044@student.tdmu.edu.vn', N'Khoa Ngoại ngữ', N'Ngôn ngữ Anh', N'D23NNA01', 2023, N'https://cdn.tdmu.dev/avatars/phamgianghi_044.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Mong muốn kết nối kỹ năng ngoại ngữ với truyền thông, dịch thuật và hỗ trợ sự kiện sinh viên.', N'Sinh viên ngôn ngữ Anh yêu thích truyền thông và biên tập nội dung', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/phamgianghi_044', N'https://github.com/phamgianghi_044', N'https://www.linkedin.com/in/phamgianghi_044', N'https://portfolio.tdmu.dev/phamgianghi_044', N'0910000044', '2003-09-08', 2, 3, 3.63, N'Phát triển năng lực truyền thông song ngữ và hỗ trợ các dự án hợp tác quốc tế.', 1, 1, 1, N'Cộng tác viên truyền thông song ngữ', N'Bình Dương hoặc TP. Hồ Chí Minh', 332, 1, 1, 1, 1, 86, N'2026-04-05T08:12:00', 1, N'2026-01-05T08:28:00', N'2026-04-21T09:56:00', N'user'),
(45, '10000045-aaaa-bbbb-cccc-000000000045', N'2023201045', N'huynhcongthanh_045', N'Huỳnh Công Thành', N'2023201045@student.tdmu.edu.vn', N'Khoa Ngoại ngữ', N'Ngôn ngữ Anh', N'D23NNA01', 2023, N'https://cdn.tdmu.dev/avatars/huynhcongthanh_045.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Mong muốn kết nối kỹ năng ngoại ngữ với truyền thông, dịch thuật và hỗ trợ sự kiện sinh viên.', N'Sinh viên ngôn ngữ Anh yêu thích truyền thông và biên tập nội dung', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/huynhcongthanh_045', N'https://github.com/huynhcongthanh_045', N'https://www.linkedin.com/in/huynhcongthanh_045', N'https://portfolio.tdmu.dev/huynhcongthanh_045', N'0910000045', '2005-10-10', 1, 3, 3.70, N'Phát triển năng lực truyền thông song ngữ và hỗ trợ các dự án hợp tác quốc tế.', 1, 1, 1, N'Cộng tác viên truyền thông song ngữ', N'Bình Dương hoặc TP. Hồ Chí Minh', 347, 1, 1, 1, 1, 89, N'2026-04-06T08:15:00', 1, N'2026-01-06T08:30:00', N'2026-04-22T09:00:00', N'user'),
(46, '10000046-aaaa-bbbb-cccc-000000000046', N'2020202046', N'vomaianh_046', N'Võ Mai Anh', N'maianh.vo.tdmu@gmail.com', N'Khoa Công nghệ thông tin', N'Khoa học dữ liệu', N'D20KHDL01', 2020, N'https://cdn.tdmu.dev/avatars/vomaianh_046.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Có kinh nghiệm thực hiện dashboard, làm sạch dữ liệu và xây dựng mô hình dự đoán cơ bản.', N'Cựu sinh viên TDMU định hướng dữ liệu và học máy ứng dụng', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/vomaianh_046', N'https://github.com/vomaianh_046', N'https://www.linkedin.com/in/vomaianh_046', N'https://portfolio.tdmu.dev/vomaianh_046', N'0910000046', '2002-11-12', 2, 5, 3.77, N'Ứng dụng dữ liệu để hỗ trợ ra quyết định trong giáo dục, tuyển sinh và dịch vụ sinh viên.', 0, 1, 1, N'Data Analyst Fresher', N'Bình Dương hoặc TP. Hồ Chí Minh', 362, 1, 1, 1, 1, 92, N'2026-04-07T08:18:00', 1, N'2026-01-07T08:32:00', N'2026-04-23T09:04:00', N'user'),
(47, '10000047-aaaa-bbbb-cccc-000000000047', N'2020202047', N'dangquangvinh_047', N'Đặng Quang Vinh', N'quangvinh.dang@outlook.com', N'Khoa Công nghệ thông tin', N'Khoa học dữ liệu', N'D20KHDL01', 2020, N'https://cdn.tdmu.dev/avatars/dangquangvinh_047.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Có kinh nghiệm thực hiện dashboard, làm sạch dữ liệu và xây dựng mô hình dự đoán cơ bản.', N'Cựu sinh viên TDMU định hướng dữ liệu và học máy ứng dụng', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/dangquangvinh_047', N'https://github.com/dangquangvinh_047', N'https://www.linkedin.com/in/dangquangvinh_047', N'https://portfolio.tdmu.dev/dangquangvinh_047', N'0910000047', '2002-12-14', 1, 5, 3.84, N'Ứng dụng dữ liệu để hỗ trợ ra quyết định trong giáo dục, tuyển sinh và dịch vụ sinh viên.', 0, 1, 1, N'Data Analyst Fresher', N'Bình Dương hoặc TP. Hồ Chí Minh', 377, 1, 1, 1, 1, 95, N'2026-04-08T08:21:00', 1, N'2026-01-08T08:34:00', N'2026-04-24T09:08:00', N'user'),
(48, '10000048-aaaa-bbbb-cccc-000000000048', N'2020202048', N'buingocdiem_048', N'Bùi Ngọc Diễm', N'ngocdiem.bui@gmail.com', N'Khoa Công nghệ thông tin', N'Khoa học dữ liệu', N'D20KHDL01', 2020, N'https://cdn.tdmu.dev/avatars/buingocdiem_048.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Có kinh nghiệm thực hiện dashboard, làm sạch dữ liệu và xây dựng mô hình dự đoán cơ bản.', N'Cựu sinh viên TDMU định hướng dữ liệu và học máy ứng dụng', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/buingocdiem_048', N'https://github.com/buingocdiem_048', N'https://www.linkedin.com/in/buingocdiem_048', N'https://portfolio.tdmu.dev/buingocdiem_048', N'0910000048', '2002-01-16', 2, 5, 2.81, N'Ứng dụng dữ liệu để hỗ trợ ra quyết định trong giáo dục, tuyển sinh và dịch vụ sinh viên.', 0, 1, 1, N'Data Analyst Fresher', N'Bình Dương hoặc TP. Hồ Chí Minh', 392, 1, 1, 1, 1, 98, N'2026-04-09T08:24:00', 1, N'2026-01-09T08:36:00', N'2026-04-01T09:12:00', N'user'),
(49, '10000049-aaaa-bbbb-cccc-000000000049', N'2020202049', N'ngominhtam_049', N'Ngô Minh Tâm', N'minhtam.ngo@outlook.com', N'Khoa Công nghệ thông tin', N'Khoa học dữ liệu', N'D20KHDL01', 2020, N'https://cdn.tdmu.dev/avatars/ngominhtam_049.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Có kinh nghiệm thực hiện dashboard, làm sạch dữ liệu và xây dựng mô hình dự đoán cơ bản.', N'Cựu sinh viên TDMU định hướng dữ liệu và học máy ứng dụng', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/ngominhtam_049', N'https://github.com/ngominhtam_049', N'https://www.linkedin.com/in/ngominhtam_049', N'https://portfolio.tdmu.dev/ngominhtam_049', N'0910000049', '2002-02-18', 2, 5, 2.88, N'Ứng dụng dữ liệu để hỗ trợ ra quyết định trong giáo dục, tuyển sinh và dịch vụ sinh viên.', 0, 1, 1, N'Data Analyst Fresher', N'Bình Dương hoặc TP. Hồ Chí Minh', 344, 1, 1, 1, 1, 72, N'2026-04-10T08:27:00', 1, N'2026-01-10T08:38:00', N'2026-04-02T09:16:00', N'user'),
(50, '10000050-aaaa-bbbb-cccc-000000000050', N'2020202050', N'dohoainam_050', N'Đỗ Hoài Nam', N'hoainam.do@gmail.com', N'Khoa Công nghệ thông tin', N'Khoa học dữ liệu', N'D20KHDL01', 2020, N'https://cdn.tdmu.dev/avatars/dohoainam_050.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Có kinh nghiệm thực hiện dashboard, làm sạch dữ liệu và xây dựng mô hình dự đoán cơ bản.', N'Cựu sinh viên TDMU định hướng dữ liệu và học máy ứng dụng', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/dohoainam_050', N'https://github.com/dohoainam_050', N'https://www.linkedin.com/in/dohoainam_050', N'https://portfolio.tdmu.dev/dohoainam_050', N'0910000050', '2002-03-20', 1, 5, 2.95, N'Ứng dụng dữ liệu để hỗ trợ ra quyết định trong giáo dục, tuyển sinh và dịch vụ sinh viên.', 0, 1, 1, N'Data Analyst Fresher', N'Bình Dương hoặc TP. Hồ Chí Minh', 359, 1, 1, 1, 1, 75, N'2026-04-11T08:30:00', 2, N'2026-01-11T08:40:00', N'2026-04-03T09:20:00', N'user'),
(51, '10000051-aaaa-bbbb-cccc-000000000051', N'CB2026051', N'nguyenthanhbinh_051', N'Nguyễn Thanh Bình', N'thanhbinh.nguyen@tdmu.edu.vn', N'Phòng Công tác sinh viên', N'Hỗ trợ sinh viên', NULL, NULL, N'https://cdn.tdmu.dev/avatars/nguyenthanhbinh_051.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-2.jpg', N'Tham gia vận hành, hỗ trợ và phát triển hệ sinh thái hồ sơ sinh viên, portfolio và kết nối học thuật.', N'Chuyên viên hỗ trợ sinh viên tại Đại học Thủ Dầu Một', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/nguyenthanhbinh_051', N'https://github.com/nguyenthanhbinh_051', N'https://www.linkedin.com/in/nguyenthanhbinh_051', N'https://portfolio.tdmu.dev/nguyenthanhbinh_051', N'0910000051', '1991-04-22', 1, NULL, NULL, N'Nâng cao trải nghiệm số cho sinh viên và hỗ trợ quản trị nền tảng an toàn, nhất quán.', 0, 1, 1, N'Chuyên viên hỗ trợ sinh viên', N'Thủ Dầu Một, Bình Dương', 374, 1, 1, 1, 1, 78, N'2026-04-12T08:33:00', 1, N'2026-01-12T08:42:00', N'2026-04-04T09:24:00', N'moderator'),
(52, '10000052-aaaa-bbbb-cccc-000000000052', N'CB2026052', N'tranquockhanh_052', N'Trần Quốc Khánh', N'quockhanh.tran@tdmu.edu.vn', N'Khoa Công nghệ thông tin', N'Cố vấn học tập', NULL, NULL, N'https://cdn.tdmu.dev/avatars/tranquockhanh_052.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-3.jpg', N'Tham gia vận hành, hỗ trợ và phát triển hệ sinh thái hồ sơ sinh viên, portfolio và kết nối học thuật.', N'Cố vấn học tập tại Đại học Thủ Dầu Một', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/tranquockhanh_052', N'https://github.com/tranquockhanh_052', N'https://www.linkedin.com/in/tranquockhanh_052', N'https://portfolio.tdmu.dev/tranquockhanh_052', N'0910000052', '1992-05-24', 1, NULL, NULL, N'Nâng cao trải nghiệm số cho sinh viên và hỗ trợ quản trị nền tảng an toàn, nhất quán.', 0, 1, 1, N'Cố vấn học tập', N'Thủ Dầu Một, Bình Dương', 389, 1, 1, 1, 1, 81, N'2026-04-13T08:36:00', 1, N'2026-01-13T08:44:00', N'2026-04-05T09:28:00', N'moderator'),
(53, '10000053-aaaa-bbbb-cccc-000000000053', N'CB2026053', N'lemylinh_053', N'Lê Mỹ Linh', N'mylinh.le@tdmu.edu.vn', N'Trung tâm Truyền thông', N'Quản trị nội dung', NULL, NULL, N'https://cdn.tdmu.dev/avatars/lemylinh_053.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-4.jpg', N'Tham gia vận hành, hỗ trợ và phát triển hệ sinh thái hồ sơ sinh viên, portfolio và kết nối học thuật.', N'Quản trị nội dung số tại Đại học Thủ Dầu Một', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/lemylinh_053', N'https://github.com/lemylinh_053', N'https://www.linkedin.com/in/lemylinh_053', N'https://portfolio.tdmu.dev/lemylinh_053', N'0910000053', '1993-06-26', 2, NULL, NULL, N'Nâng cao trải nghiệm số cho sinh viên và hỗ trợ quản trị nền tảng an toàn, nhất quán.', 0, 1, 1, N'Quản trị nội dung số', N'Thủ Dầu Một, Bình Dương', 404, 1, 1, 1, 1, 84, N'2026-04-14T08:39:00', 1, N'2026-01-14T08:46:00', N'2026-04-06T09:32:00', N'moderator'),
(54, '10000054-aaaa-bbbb-cccc-000000000054', N'CB2026054', N'phamduykhoa_054', N'Phạm Duy Khoa', N'duykhoa.pham@tdmu.edu.vn', N'Phòng Công nghệ thông tin', N'Quản trị hệ thống', NULL, NULL, N'https://cdn.tdmu.dev/avatars/phamduykhoa_054.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-5.jpg', N'Tham gia vận hành, hỗ trợ và phát triển hệ sinh thái hồ sơ sinh viên, portfolio và kết nối học thuật.', N'Quản trị hệ thống tại Đại học Thủ Dầu Một', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/phamduykhoa_054', N'https://github.com/phamduykhoa_054', N'https://www.linkedin.com/in/phamduykhoa_054', N'https://portfolio.tdmu.dev/phamduykhoa_054', N'0910000054', '1994-07-01', 1, NULL, NULL, N'Nâng cao trải nghiệm số cho sinh viên và hỗ trợ quản trị nền tảng an toàn, nhất quán.', 0, 1, 1, N'Quản trị hệ thống', N'Thủ Dầu Một, Bình Dương', 419, 1, 1, 1, 1, 87, N'2026-04-15T08:42:00', 3, N'2026-01-15T08:48:00', N'2026-04-07T09:36:00', N'admin'),
(55, '10000055-aaaa-bbbb-cccc-000000000055', N'CB2026055', N'huynhthaonhi_055', N'Huỳnh Thảo Nhi', N'thaonhi.huynh@tdmu.edu.vn', N'Ban Quản trị nền tảng', N'Quản lý hệ thống', NULL, NULL, N'https://cdn.tdmu.dev/avatars/huynhthaonhi_055.jpg', N'https://cdn.tdmu.dev/covers/tdmu-campus-1.jpg', N'Tham gia vận hành, hỗ trợ và phát triển hệ sinh thái hồ sơ sinh viên, portfolio và kết nối học thuật.', N'Quản lý nền tảng sinh viên tại Đại học Thủ Dầu Một', N'Thủ Dầu Một, Bình Dương', N'https://profile.tdmu.dev/huynhthaonhi_055', N'https://github.com/huynhthaonhi_055', N'https://www.linkedin.com/in/huynhthaonhi_055', N'https://portfolio.tdmu.dev/huynhthaonhi_055', N'0910000055', '1995-08-03', 2, NULL, NULL, N'Nâng cao trải nghiệm số cho sinh viên và hỗ trợ quản trị nền tảng an toàn, nhất quán.', 0, 1, 1, N'Quản lý nền tảng sinh viên', N'Thủ Dầu Một, Bình Dương', 434, 1, 1, 1, 1, 90, N'2026-04-16T08:45:00', 1, N'2026-01-16T08:50:00', N'2026-04-08T09:40:00', N'admin');


/* ---------- Xóa seed cũ an toàn theo UserId/StudentCode/Username/Email ---------- */
DECLARE @SeedUsersToReplace TABLE (UserId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY);

INSERT INTO @SeedUsersToReplace(UserId)
SELECT DISTINCT u.UserId
FROM dbo.Users u
WHERE u.UserId IN (SELECT UserId FROM #SeedUserProfiles)
   OR u.StudentCode IN (SELECT StudentCode FROM #SeedUserProfiles)
   OR u.Username IN (SELECT Username FROM #SeedUserProfiles)
   OR u.TDMUEmail IN (SELECT TDMUEmail FROM #SeedUserProfiles WHERE TDMUEmail IS NOT NULL);

DELETE FROM dbo.Blocks
WHERE BlockerId IN (SELECT UserId FROM @SeedUsersToReplace)
   OR BlockedId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.FriendRequests
WHERE FromUserId IN (SELECT UserId FROM @SeedUsersToReplace)
   OR ToUserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.Follows
WHERE FollowerId IN (SELECT UserId FROM @SeedUsersToReplace)
   OR FolloweeId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserHighlights
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserCVs
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserContributions
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE pa
FROM dbo.UserProjectAssets pa
INNER JOIN dbo.UserProjects p ON p.ProjectId = pa.ProjectId
WHERE p.UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserProjects
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserCertificates
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserExperiences
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserEducations
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserSkills
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserLinks
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.UserSettings
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

DELETE FROM dbo.User_OutboxEvents
WHERE AggregateId IN (SELECT UserId FROM @SeedUsersToReplace)
   OR TraceId LIKE N'trace-user-tdmu-%';

DELETE FROM dbo.Users
WHERE UserId IN (SELECT UserId FROM @SeedUsersToReplace);

/* ---------- 1) Users: 55 hồ sơ khớp seed AuthDB ---------- */
INSERT INTO dbo.Users
(
    UserId, StudentCode, Username, FullName, TDMUEmail,
    Department, Major, ClassName, EnrollmentYear,
    AvatarUrl, CoverUrl, Bio, Headline, Location,
    WebsiteUrl, GithubUrl, LinkedInUrl, PortfolioUrl,
    PhoneNumber, DateOfBirth, Gender, CurrentYear, GPA, CareerGoal,
    OpenToInternship, OpenToJob, OpenToCollab,
    PreferredJobTitle, PreferredLocation,
    ContributionScore, FollowersCount, FollowingCount,
    PublicRepoCount, PinnedProjectCount, ProfileCompletion,
    LastProfileSyncAt, Status, CreatedAt, UpdatedAt
)
SELECT
    UserId, StudentCode, Username, FullName, TDMUEmail,
    Department, Major, ClassName, EnrollmentYear,
    AvatarUrl, CoverUrl, Bio, Headline, Location,
    WebsiteUrl, GithubUrl, LinkedInUrl, PortfolioUrl,
    PhoneNumber, DateOfBirth, Gender, CurrentYear, GPA, CareerGoal,
    OpenToInternship, OpenToJob, OpenToCollab,
    PreferredJobTitle, PreferredLocation,
    ContributionScore, FollowersCount, FollowingCount,
    PublicRepoCount, PinnedProjectCount, ProfileCompletion,
    LastProfileSyncAt, Status, CreatedAt, UpdatedAt
FROM #SeedUserProfiles;

/* ---------- 2) UserSettings: mỗi user một cấu hình riêng tư ---------- */
INSERT INTO dbo.UserSettings
(
    UserId, PrivacyLevel, AllowDM, ShowEmail, ShowPhoneNumber,
    ShowDateOfBirth, ShowEducation, ShowExperience, ShowCertificates,
    ShowProjects, ShowContributionHeatmap, ShowGitHubStyleProfile,
    AllowCvDownload, IsCvPublic, NotifyPrefsJson, UpdatedAt
)
SELECT
    s.UserId,
    CASE WHEN s.RoleName IN (N'admin', N'moderator') THEN 2 WHEN s.UserNo % 9 = 0 THEN 3 ELSE 1 END,
    CASE WHEN s.Status = 3 THEN 0 ELSE 1 END,
    CASE WHEN s.UserNo % 4 = 0 OR s.RoleName <> N'user' THEN 1 ELSE 0 END,
    CASE WHEN s.RoleName <> N'user' THEN 1 ELSE 0 END,
    0,
    1, 1, 1, 1, 1, 1,
    1,
    CASE WHEN s.Status = 3 THEN 0 ELSE 1 END,
    N'{"email":true,"project":true,"certificate":true,"friendRequest":true}',
    DATEADD(MINUTE, s.UserNo, CAST('2026-04-20T08:00:00' AS DATETIME2(7)))
FROM #SeedUserProfiles s;

/* ---------- 3) UserLinks: GitHub + Portfolio + LinkedIn ---------- */
INSERT INTO dbo.UserLinks
(LinkId, UserId, Type, Title, Url, DisplayOrder, IsVisible, CreatedAt, UpdatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(v.Prefix, N'-1111-2222-3333-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ) AS LinkId,
    s.UserId,
    v.Type,
    v.Title,
    v.Url,
    v.DisplayOrder,
    1,
    DATEADD(DAY, s.UserNo, CAST('2026-02-01T08:00:00' AS DATETIME2(7))),
    DATEADD(DAY, s.UserNo, CAST('2026-04-01T08:00:00' AS DATETIME2(7)))
FROM #SeedUserProfiles s
CROSS APPLY
(
    VALUES
    (N'41000000', N'github',    N'GitHub cá nhân',       s.GithubUrl,    1),
    (N'42000000', N'portfolio', N'Portfolio cá nhân',    s.PortfolioUrl, 2),
    (N'43000000', N'linkedin',  N'LinkedIn học tập/nghề nghiệp', s.LinkedInUrl, 3)
) v(Prefix, Type, Title, Url, DisplayOrder)
WHERE v.Url IS NOT NULL;

/* ---------- 4) UserSkills: kỹ năng theo ngành ---------- */
INSERT INTO dbo.UserSkills
(SkillId, UserId, SkillName, Category, ProficiencyLevel, YearsOfExperience, IsPrimary, DisplayOrder, CreatedAt, UpdatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(v.Prefix, N'-2222-3333-4444-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    v.SkillName,
    v.Category,
    v.ProficiencyLevel,
    v.YearsOfExperience,
    CASE WHEN v.DisplayOrder = 1 THEN 1 ELSE 0 END,
    v.DisplayOrder,
    DATEADD(DAY, s.UserNo, CAST('2026-02-05T08:00:00' AS DATETIME2(7))),
    DATEADD(DAY, s.UserNo, CAST('2026-04-05T08:00:00' AS DATETIME2(7)))
FROM #SeedUserProfiles s
CROSS APPLY
(
    VALUES
    (
        N'51000000',
        CASE
            WHEN s.Major LIKE N'%Thiết kế%' THEN N'Figma'
            WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Digital Marketing'
            WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Biên tập nội dung tiếng Anh'
            WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Python'
            WHEN s.RoleName <> N'user' THEN N'Quản trị hệ thống'
            ELSE N'C#'
        END,
        N'Chuyên môn',
        CAST(3 + (s.UserNo % 3) AS TINYINT),
        CAST(0.5 + (s.UserNo % 4) * 0.5 AS DECIMAL(4,1)),
        1
    ),
    (
        N'52000000',
        CASE
            WHEN s.Major LIKE N'%Thiết kế%' THEN N'Adobe Illustrator'
            WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Nghiên cứu thị trường'
            WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Dịch thuật'
            WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'SQL Server'
            WHEN s.RoleName <> N'user' THEN N'Hỗ trợ người dùng'
            ELSE N'ASP.NET Core'
        END,
        N'Công cụ',
        CAST(2 + (s.UserNo % 4) AS TINYINT),
        CAST(0.5 + (s.UserNo % 3) * 0.5 AS DECIMAL(4,1)),
        2
    ),
    (
        N'53000000',
        CASE
            WHEN s.Major LIKE N'%Thiết kế%' THEN N'UX/UI Design'
            WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Excel và báo cáo'
            WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Giao tiếp học thuật'
            WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Machine Learning cơ bản'
            WHEN s.RoleName <> N'user' THEN N'Quản lý dữ liệu'
            ELSE N'SQL Server'
        END,
        N'Bổ trợ',
        CAST(2 + (s.UserNo % 3) AS TINYINT),
        CAST(0.5 + (s.UserNo % 2) * 0.5 AS DECIMAL(4,1)),
        3
    )
) v(Prefix, SkillName, Category, ProficiencyLevel, YearsOfExperience, DisplayOrder);

/* ---------- 5) UserEducations ---------- */
INSERT INTO dbo.UserEducations
(EducationId, UserId, SchoolName, Degree, Major, StartDate, EndDate, IsCurrent, GPA, Description, DisplayOrder, CreatedAt, UpdatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'54000000-3333-4444-5555-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    N'Đại học Thủ Dầu Một',
    CASE WHEN s.RoleName = N'user' THEN N'Sinh viên đại học' ELSE N'Cán bộ/giảng viên phụ trách nền tảng sinh viên' END,
    s.Major,
    CASE WHEN s.EnrollmentYear IS NULL THEN CAST('2015-09-01' AS DATE) ELSE DATEFROMPARTS(s.EnrollmentYear, 9, 1) END,
    CASE WHEN s.RoleName = N'user' THEN NULL ELSE CAST('2020-06-30' AS DATE) END,
    CASE WHEN s.RoleName = N'user' THEN 1 ELSE 0 END,
    s.GPA,
    CASE
        WHEN s.RoleName = N'user' THEN N'Hồ sơ học tập được đồng bộ cho trang cá nhân, CV và portfolio sinh viên.'
        ELSE N'Hồ sơ chuyên môn dùng cho vai trò quản trị, hỗ trợ sinh viên và cố vấn học tập.'
    END,
    1,
    s.CreatedAt,
    s.UpdatedAt
FROM #SeedUserProfiles s;

/* ---------- 6) UserExperiences: kinh nghiệm/thực tập mẫu ---------- */
INSERT INTO dbo.UserExperiences
(ExperienceId, UserId, CompanyName, PositionTitle, EmploymentType, Location, IsRemote, StartDate, EndDate, IsCurrent, Description, TechStack, AchievementSummary, DisplayOrder, CreatedAt, UpdatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'55000000-4444-5555-6666-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    CASE
        WHEN s.RoleName <> N'user' THEN N'Đại học Thủ Dầu Một'
        WHEN s.Major LIKE N'%Thiết kế%' THEN N'TDMU Design Lab'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Câu lạc bộ Khởi nghiệp TDMU'
        WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Trung tâm Ngoại ngữ TDMU'
        ELSE N'TDMU Student Tech Lab'
    END,
    CASE
        WHEN s.RoleName <> N'user' THEN s.PreferredJobTitle
        WHEN s.Major LIKE N'%Thiết kế%' THEN N'CTV Thiết kế truyền thông'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Thực tập sinh Marketing'
        WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'CTV Biên tập nội dung song ngữ'
        WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Fresher Data Analyst'
        ELSE N'Thực tập sinh phát triển web'
    END,
    CASE WHEN s.RoleName <> N'user' THEN N'Full-time' ELSE N'Internship' END,
    s.PreferredLocation,
    CASE WHEN s.UserNo % 5 = 0 THEN 1 ELSE 0 END,
    DATEADD(MONTH, -6 - (s.UserNo % 8), CAST('2026-04-01' AS DATE)),
    CASE WHEN s.RoleName = N'user' AND s.UserNo % 4 <> 0 THEN DATEADD(MONTH, -1, CAST('2026-04-01' AS DATE)) ELSE NULL END,
    CASE WHEN s.RoleName <> N'user' OR s.UserNo % 4 = 0 THEN 1 ELSE 0 END,
    CASE
        WHEN s.RoleName <> N'user' THEN N'Phụ trách vận hành, kiểm duyệt dữ liệu hồ sơ và hỗ trợ người dùng trên nền tảng sinh viên.'
        ELSE N'Tham gia dự án học thuật, xây dựng sản phẩm mẫu và hoàn thiện hồ sơ năng lực cá nhân.'
    END,
    CASE
        WHEN s.Major LIKE N'%Thiết kế%' THEN N'Figma, Illustrator, Photoshop'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Excel, Canva, Google Analytics'
        WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Google Workspace, Grammarly, Notion'
        WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Python, SQL Server, Power BI'
        ELSE N'C#, ASP.NET Core, SQL Server, React'
    END,
    N'Hoàn thành hồ sơ dự án, báo cáo tiến độ và phần trình bày portfolio cá nhân.',
    1,
    s.CreatedAt,
    s.UpdatedAt
FROM #SeedUserProfiles s
WHERE s.UserNo % 2 = 0 OR s.RoleName <> N'user';

/* ---------- 7) UserCertificates ---------- */
INSERT INTO dbo.UserCertificates
(CertificateId, UserId, CertificateName, Issuer, IssueDate, ExpirationDate, CredentialId, CredentialUrl, AttachmentUrl, Description, DisplayOrder, CreatedAt, UpdatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'56000000-5555-6666-7777-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    CASE
        WHEN s.Major LIKE N'%Thiết kế%' THEN N'Google UX Design Foundations'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Fundamentals of Digital Marketing'
        WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'English Communication for Academic Purposes'
        WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Python for Data Analysis'
        WHEN s.RoleName <> N'user' THEN N'Quản trị và bảo mật nền tảng sinh viên'
        ELSE N'Web API Development with ASP.NET Core'
    END,
    CASE
        WHEN s.RoleName <> N'user' THEN N'TDMU Internal Training'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Google Digital Garage'
        ELSE N'TDMU Learning Hub'
    END,
    DATEADD(DAY, -30 - s.UserNo, CAST('2026-04-01' AS DATE)),
    NULL,
    CONCAT(N'TDMU-CERT-', RIGHT(CONCAT('0000', CONVERT(VARCHAR(4), s.UserNo)), 4)),
    CONCAT(N'https://certs.tdmu.dev/', s.Username),
    CONCAT(N'https://cdn.tdmu.dev/certificates/', s.Username, N'.pdf'),
    N'Chứng chỉ minh họa năng lực học tập và kỹ năng nghề nghiệp trong hồ sơ cá nhân.',
    1,
    s.CreatedAt,
    s.UpdatedAt
FROM #SeedUserProfiles s
WHERE s.UserNo % 3 = 0 OR s.RoleName <> N'user';

/* ---------- 8) UserProjects / Portfolio ---------- */
INSERT INTO dbo.UserProjects
(ProjectId, UserId, ProjectName, Slug, Summary, Description, RepositoryUrl, DemoUrl, ThumbnailUrl, BannerUrl, PrimaryLanguage, TechStack, Visibility, IsPinned, IsFeatured, IsAcademicProject, StarsCount, ForksCount, WatchersCount, CommitCount, LastContributionAt, StartedAt, CompletedAt, DisplayOrder, CreatedAt, UpdatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'60000000-6666-7777-8888-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    CASE
        WHEN s.Major LIKE N'%Thiết kế%' THEN N'Bộ nhận diện sự kiện sinh viên TDMU'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Kế hoạch truyền thông cho sản phẩm sinh viên'
        WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Blog song ngữ giới thiệu đời sống sinh viên'
        WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Dashboard phân tích hoạt động học tập'
        WHEN s.RoleName <> N'user' THEN N'Nền tảng quản lý hồ sơ và portfolio sinh viên'
        ELSE N'Cổng hỗ trợ sinh viên TDMU'
    END,
    CONCAT(s.Username, N'-main-project'),
    CASE
        WHEN s.Major LIKE N'%Thiết kế%' THEN N'Dự án thiết kế portfolio gồm logo, poster, bài đăng mạng xã hội và guideline ngắn.'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Dự án mô phỏng chiến dịch marketing số với mục tiêu, chân dung khách hàng và KPI.'
        WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Dự án nội dung song ngữ giúp sinh viên mới tìm hiểu dịch vụ và hoạt động tại trường.'
        WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Dashboard làm sạch dữ liệu, trực quan hóa chỉ số và gợi ý hành động.'
        WHEN s.RoleName <> N'user' THEN N'Dự án quản trị hồ sơ, phân quyền, kiểm duyệt và đồng bộ dữ liệu người dùng.'
        ELSE N'Ứng dụng web hỗ trợ gửi yêu cầu, tra cứu ticket và quản lý phản hồi cho sinh viên.'
    END,
    N'Dự án được xây dựng cho mục đích học tập, trình bày năng lực và kết nối hồ sơ cá nhân trong hệ sinh thái TDMU.',
    CONCAT(N'https://github.com/', s.Username, N'/', s.Username, N'-main-project'),
    CONCAT(N'https://demo.tdmu.dev/', s.Username),
    CONCAT(N'https://cdn.tdmu.dev/projects/', s.Username, N'/thumbnail.jpg'),
    CONCAT(N'https://cdn.tdmu.dev/projects/', s.Username, N'/banner.jpg'),
    CASE
        WHEN s.Major LIKE N'%Thiết kế%' THEN N'Figma'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Marketing'
        WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Content'
        WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Python'
        WHEN s.RoleName <> N'user' THEN N'C#'
        ELSE N'C#'
    END,
    CASE
        WHEN s.Major LIKE N'%Thiết kế%' THEN N'Figma, Illustrator, Photoshop'
        WHEN s.Major LIKE N'%Quản trị kinh doanh%' THEN N'Excel, Canva, Social Media Plan'
        WHEN s.Major LIKE N'%Ngôn ngữ Anh%' THEN N'Content Writing, Translation, SEO'
        WHEN s.Major LIKE N'%Khoa học dữ liệu%' THEN N'Python, Pandas, SQL Server, Power BI'
        WHEN s.RoleName <> N'user' THEN N'ASP.NET Core, SQL Server, Docker'
        ELSE N'ASP.NET Core, SQL Server, React, Docker'
    END,
    1,
    1,
    CASE WHEN s.UserNo % 5 = 0 THEN 1 ELSE 0 END,
    CASE WHEN s.RoleName = N'user' THEN 1 ELSE 0 END,
    5 + (s.UserNo % 15),
    s.UserNo % 4,
    3 + (s.UserNo % 10),
    12 + (s.UserNo * 3),
    DATEADD(DAY, -s.UserNo, CAST('2026-04-20T08:00:00' AS DATETIME2(7))),
    DATEADD(MONTH, -4 - (s.UserNo % 5), CAST('2026-04-01' AS DATE)),
    CASE WHEN s.UserNo % 6 = 0 THEN DATEADD(DAY, -10, CAST('2026-04-01' AS DATE)) ELSE NULL END,
    1,
    s.CreatedAt,
    s.UpdatedAt
FROM #SeedUserProfiles s;

/* ---------- 9) UserProjectAssets ---------- */
INSERT INTO dbo.UserProjectAssets
(AssetId, ProjectId, AssetType, Title, Url, MimeType, DisplayOrder, CreatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'61000000-7777-8888-9999-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'60000000-6666-7777-8888-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    N'image',
    N'Ảnh minh họa dự án',
    CONCAT(N'https://cdn.tdmu.dev/projects/', s.Username, N'/preview-01.jpg'),
    N'image/jpeg',
    1,
    DATEADD(DAY, s.UserNo, CAST('2026-03-01T08:00:00' AS DATETIME2(7)))
FROM #SeedUserProfiles s;

/* ---------- 10) UserContributions: dữ liệu heatmap/hoạt động ---------- */
INSERT INTO dbo.UserContributions
(ContributionId, UserId, SourceType, SourceId, SourceTitle, ContributionDate, ContributionCount, MetadataJson, CreatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(v.Prefix, N'-8888-9999-aaaa-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    v.SourceType,
    CONCAT(v.SourceType, N'-', s.Username, N'-', v.DisplayOrder),
    v.SourceTitle,
    DATEADD(DAY, -((s.UserNo * v.DisplayOrder) % 45), CAST('2026-04-20' AS DATE)),
    1 + ((s.UserNo + v.DisplayOrder) % 4),
    CONCAT(N'{"seed":true,"source":"tdmu-user-service","displayOrder":', v.DisplayOrder, N'}'),
    DATEADD(DAY, -((s.UserNo * v.DisplayOrder) % 45), CAST('2026-04-20T08:00:00' AS DATETIME2(7)))
FROM #SeedUserProfiles s
CROSS APPLY
(
    VALUES
    (N'71000000', N'project',     N'Cập nhật dự án portfolio', 1),
    (N'72000000', N'certificate', N'Hoàn thành chứng chỉ/kỹ năng', 2),
    (N'73000000', N'post',        N'Đăng bài chia sẻ học tập', 3)
) v(Prefix, SourceType, SourceTitle, DisplayOrder);

/* ---------- 11) UserCVs ---------- */
INSERT INTO dbo.UserCVs
(CvId, UserId, CvTitle, FileName, FileUrl, FileExt, FileSizeBytes, MimeType, VersionNo, IsPrimary, IsPublic, Summary, UploadedAt, UpdatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'80000000-9999-aaaa-bbbb-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    CONCAT(N'CV ', s.FullName),
    CONCAT(N'cv-', s.Username, N'.pdf'),
    CONCAT(N'https://cdn.tdmu.dev/cv/', s.Username, N'.pdf'),
    N'.pdf',
    220000 + s.UserNo * 1024,
    N'application/pdf',
    1,
    1,
    CASE WHEN s.Status = 3 THEN 0 ELSE 1 END,
    CONCAT(N'CV tóm tắt học vấn, kỹ năng và dự án nổi bật của ', s.FullName, N'.'),
    DATEADD(DAY, s.UserNo, CAST('2026-03-01T08:00:00' AS DATETIME2(7))),
    DATEADD(DAY, s.UserNo, CAST('2026-04-01T08:00:00' AS DATETIME2(7)))
FROM #SeedUserProfiles s;

/* ---------- 12) UserHighlights ---------- */
INSERT INTO dbo.UserHighlights
(HighlightId, UserId, HighlightType, Title, Description, RefUrl, RefId, DisplayOrder, IsVisible, CreatedAt, UpdatedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'81000000-aaaa-bbbb-cccc-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    CASE WHEN s.UserNo % 3 = 0 THEN N'certificate' WHEN s.UserNo % 3 = 1 THEN N'project' ELSE N'achievement' END,
    CASE
        WHEN s.UserNo % 3 = 0 THEN N'Hoàn thành chứng chỉ kỹ năng'
        WHEN s.UserNo % 3 = 1 THEN N'Dự án portfolio được ghim'
        ELSE N'Hồ sơ học tập nổi bật'
    END,
    N'Mục nổi bật dùng để hiển thị nhanh trên trang hồ sơ công khai và trang GitHub-style profile.',
    s.PortfolioUrl,
    CONCAT(N'highlight-', s.Username),
    1,
    1,
    s.CreatedAt,
    s.UpdatedAt
FROM #SeedUserProfiles s;

/* ---------- 13) Follows: mỗi user follow user kế tiếp, tạo mạng xã hội mẫu ---------- */
INSERT INTO dbo.Follows (FollowerId, FolloweeId, CreatedAt)
SELECT
    s.UserId,
    s2.UserId,
    DATEADD(DAY, s.UserNo, CAST('2026-03-10T08:00:00' AS DATETIME2(7)))
FROM #SeedUserProfiles s
INNER JOIN #SeedUserProfiles s2
    ON s2.UserNo = CASE WHEN s.UserNo = 55 THEN 1 ELSE s.UserNo + 1 END
WHERE s.UserId <> s2.UserId;

/* ---------- 14) FriendRequests: lời mời kết nối mẫu ---------- */
INSERT INTO dbo.FriendRequests
(RequestId, FromUserId, ToUserId, Status, IsActive, Message, CreatedAt, RespondedAt)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'82000000-bbbb-cccc-dddd-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    s2.UserId,
    CASE WHEN s.UserNo % 4 = 0 THEN 2 WHEN s.UserNo % 4 = 1 THEN 1 WHEN s.UserNo % 4 = 2 THEN 3 ELSE 4 END,
    CASE WHEN s.UserNo % 4 = 1 THEN 1 ELSE 0 END,
    N'Mình muốn kết nối để trao đổi thêm về học tập, dự án và cơ hội cộng tác.',
    DATEADD(DAY, s.UserNo, CAST('2026-03-15T08:00:00' AS DATETIME2(7))),
    CASE WHEN s.UserNo % 4 = 1 THEN NULL ELSE DATEADD(DAY, s.UserNo + 1, CAST('2026-03-15T08:00:00' AS DATETIME2(7))) END
FROM #SeedUserProfiles s
INNER JOIN #SeedUserProfiles s2
    ON s2.UserNo = s.UserNo + 10
WHERE s.UserNo BETWEEN 1 AND 20;

/* ---------- 15) Blocks: vài quan hệ chặn mẫu ---------- */
INSERT INTO dbo.Blocks (BlockerId, BlockedId, CreatedAt)
SELECT
    s.UserId,
    s2.UserId,
    DATEADD(DAY, s.UserNo, CAST('2026-03-25T08:00:00' AS DATETIME2(7)))
FROM #SeedUserProfiles s
INNER JOIN #SeedUserProfiles s2
    ON s2.UserNo = s.UserNo + 30
WHERE s.UserNo IN (3, 7, 11, 15, 19);

/* ---------- 16) User_OutboxEvents ---------- */
INSERT INTO dbo.User_OutboxEvents
(EventId, AggregateId, EventType, PayloadJson, OccurredAt, ProcessedAt, TraceId)
SELECT
    CONVERT(UNIQUEIDENTIFIER,
        CONCAT(N'90000000-cccc-dddd-eeee-', RIGHT(CONCAT('000000000000', CONVERT(VARCHAR(12), s.UserNo)), 12))
    ),
    s.UserId,
    CASE
        WHEN s.Status = 3 THEN N'User.ProfileSuspended'
        WHEN s.Status = 2 THEN N'User.ProfilePendingReview'
        ELSE N'User.ProfileCreated'
    END,
    CONCAT(
        N'{"userId":"', CONVERT(NVARCHAR(36), s.UserId),
        N'","studentCode":"', s.StudentCode,
        N'","username":"', s.Username,
        N'","fullName":"', s.FullName,
        N'","email":"', ISNULL(s.TDMUEmail, N''),
        N'","department":"', ISNULL(s.Department, N''),
        N'","major":"', ISNULL(s.Major, N''),
        N'","status":', s.Status,
        N'}'
    ),
    DATEADD(MINUTE, s.UserNo * 7, CAST('2026-04-10T08:00:00' AS DATETIME2(7))),
    CASE WHEN s.UserNo % 5 = 0 THEN DATEADD(MINUTE, s.UserNo * 7 + 2, CAST('2026-04-10T08:00:00' AS DATETIME2(7))) ELSE NULL END,
    CONCAT(N'trace-user-tdmu-', RIGHT(CONCAT('000', CONVERT(VARCHAR(3), s.UserNo)), 3))
FROM #SeedUserProfiles s;

DROP TABLE #SeedUserProfiles;
GO

/* Kiểm tra nhanh sau khi chạy:
SELECT COUNT(*) AS TotalUsers FROM dbo.Users;
SELECT TOP 10 StudentCode, Username, FullName, TDMUEmail, Department, Major, Status
FROM dbo.Users
ORDER BY CreatedAt;

SELECT COUNT(*) AS TotalSettings FROM dbo.UserSettings;
SELECT COUNT(*) AS TotalSkills FROM dbo.UserSkills;
SELECT COUNT(*) AS TotalProjects FROM dbo.UserProjects;
SELECT COUNT(*) AS TotalCVs FROM dbo.UserCVs;

SELECT Department, Major, COUNT(*) AS TotalProfiles
FROM dbo.Users
GROUP BY Department, Major
ORDER BY Department, Major;
*/
