-- Lệnh SQL: Unlock path-001, lock all others
USE JudgeDB;

-- Unlock path-001
UPDATE Judge_LearningPaths 
SET MinimumXpRequired = 0 
WHERE Slug = 'path-001-tong-hai-so-nguyen';

-- Lock others 
UPDATE Judge_LearningPaths 
SET MinimumXpRequired = 1000 
WHERE Slug != 'path-001-tong-hai-so-nguyen';

-- PathPrerequisites: 100% for non-path001
UPDATE Judge_PathPrerequisites 
SET MinCompletionPercent = 100 
WHERE PathId NOT IN (SELECT PathId FROM Judge_LearningPaths WHERE Slug = 'path-001-tong-hai-so-nguyen');

-- UserPathStates: Unlock path001, lock others
UPDATE Judge_UserPathStates 
SET IsUnlocked = 1, Status = 'active', UpdatedAt = SYSUTCDATETIME()
WHERE PathId IN (SELECT PathId FROM Judge_LearningPaths WHERE Slug = 'path-001-tong-hai-so-nguyen');

UPDATE Judge_UserPathStates 
SET IsUnlocked = 0, Status = 'locked', UpdatedAt = SYSUTCDATETIME()
WHERE PathId NOT IN (SELECT PathId FROM Judge_LearningPaths WHERE Slug = 'path-001-tong-hai-so-nguyen');

-- Check
PRINT '=== PATHS ===';
SELECT Slug, MinimumXpRequired, Status, IsPublic FROM Judge_LearningPaths ORDER BY SortOrder;

PRINT '=== USER PATH STATES (path001) ===';
SELECT 'path-001 unlocked' as Status;

PRINT '=== Done! Restart judge-api + reload /code/learn?refresh=1 ===';
