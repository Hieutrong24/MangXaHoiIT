-- Hoàn thành Lesson1 để mở Lesson2/Path2
USE JudgeDB;

-- Giả định Lesson1 LessonId từ seed (run SELECT nếu cần)
DECLARE @Lesson1Id UNIQUEIDENTIFIER = (SELECT TOP 1 LessonId FROM Judge_Lessons WHERE Title LIKE '%Tổng hai số%' );
DECLARE @UserId UNIQUEIDENTIFIER = (SELECT TOP 1 UserId FROM Judge_UserLessonStates LIMIT 1); -- Thay UserId logged in

-- Complete Lesson1
UPDATE Judge_UserLessonStates SET Status = 'completed', CompletionPercent = 100, CompletedAt = SYSUTCDATETIME(), UpdatedAt = SYSUTCDATETIME()
WHERE LessonId = @Lesson1Id AND UserId = @UserId;

-- Award XP
INSERT INTO Judge_UserXP (UserXpId, UserId, SourceType, SourceId, XpDelta, Reason, CreatedAt)
VALUES (NEWID(), @UserId, 'lesson', @Lesson1Id, 25, 'Completed Lesson1', SYSUTCDATETIME());

-- Unlock next Path/Lesson (force)
UPDATE Judge_UserPathStates SET IsUnlocked = 1, Status = 'active', CurrentLessonId = (SELECT TOP 1 LessonId FROM Judge_Lessons WHERE PathId = PathId ORDER BY SortOrder), UpdatedAt = SYSUTCDATETIME()
WHERE UserId = @UserId AND SortOrder = 2; -- Path2

-- Check
SELECT 'Lesson1 completed, Path2 unlocked' as Status;
SELECT lp.Slug, ups.IsUnlocked, ups.Status FROM Judge_UserPathStates ups JOIN Judge_LearningPaths lp ON ups.PathId = lp.PathId WHERE ups.UserId = @UserId ORDER BY lp.SortOrder;
