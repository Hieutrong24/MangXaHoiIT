-- Setup tự động: Complete path001 lesson → unlock path002

USE JudgeDB;

-- Add IF NOT EXISTS PathPrerequisite
IF NOT EXISTS (SELECT 1 FROM Judge_PathPrerequisites pp JOIN Judge_LearningPaths lp2 ON pp.PathId = lp2.PathId JOIN Judge_LearningPaths lp1 ON pp.RequiredPathId = lp1.PathId WHERE lp2.Slug = 'path-002-cong-doanh-thu-hai-quay' AND lp1.Slug = 'path-001-tong-hai-so-nguyen')
INSERT INTO Judge_PathPrerequisites (PathPrerequisiteId, PathId, RequiredPathId, RequirementType, MinCompletionPercent, SortOrder, CreatedAt)
SELECT NEWID(), PathId, (SELECT PathId FROM Judge_LearningPaths WHERE Slug = 'path-001-tong-hai-so-nguyen'), 'complete_path', 100.00, 1, SYSUTCDATETIME()
FROM Judge_LearningPaths WHERE Slug = 'path-002-cong-doanh-thu-hai-quay';

PRINT 'Prereq added: path002 require path001 100%';

-- Ensure lesson1 complete triggers path1 complete (if single lesson)
-- Manual complete lesson1 for user (thay UserId)
-- Comment out manual, use browser button
-- DECLARE @UserId UNIQUEIDENTIFIER = 'your-user-id-here';
-- DECLARE @Lesson1Id UNIQUEIDENTIFIER = (SELECT LessonId FROM Judge_Lessons WHERE PathId = @Path001Id);
-- UPDATE Judge_UserLessonStates SET Status = 'completed', CompletedAt = SYSUTCDATETIME() WHERE LessonId = @Lesson1Id AND UserId = @UserId;

-- Trigger recalculate by calling backend (or manual)
-- Run POST /api/learn/lessons/{@Lesson1Id}/complete with userId to trigger auto recalc

PRINT 'Setup auto unlock ready! Complete lesson1 → path2 auto mở';

-- Check
SELECT lp1.Slug as Path1, lp2.Slug as Path2, pp.MinCompletionPercent FROM Judge_LearningPaths lp1 JOIN Judge_PathPrerequisites pp ON pp.RequiredPathId = lp1.PathId JOIN Judge_LearningPaths lp2 ON pp.PathId = lp2.PathId WHERE lp1.Slug = 'path-001-tong-hai-so-nguyen';
