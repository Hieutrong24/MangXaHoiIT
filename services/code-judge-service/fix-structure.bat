@echo off
setlocal enabledelayedexpansion

REM ==========================================================
REM  Create folders/files to match desired Clean Architecture structure
REM  Run inside: services\code-judge-service
REM ==========================================================

REM Detect base path: prefer src\CodeJudge.API ; fallback CodeJudge.API
set BASE=src
if not exist "src\CodeJudge.API" (
  if exist "CodeJudge.API" (
    set BASE=.
  ) else (
    REM If neither exists, create src and assume projects will be there
    set BASE=src
  )
)

echo Using BASE = "%BASE%"

REM ---------------------------
REM Create directories
REM ---------------------------

REM API
mkdir "%BASE%\CodeJudge.API\Controllers" >nul 2>nul
mkdir "%BASE%\CodeJudge.API\Middlewares" >nul 2>nul
mkdir "%BASE%\CodeJudge.API\Extensions" >nul 2>nul

REM Application
mkdir "%BASE%\CodeJudge.Application\Interfaces\Repositories" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\DTOs" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Features\Problems\Commands" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Features\Problems\Queries" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Features\TestCases\Commands" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Features\TestCases\Queries" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Features\Submissions\Commands" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Features\Submissions\Queries" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Services" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Common" >nul 2>nul
mkdir "%BASE%\CodeJudge.Application\Validation" >nul 2>nul

REM Domain
mkdir "%BASE%\CodeJudge.Domain\Entities" >nul 2>nul
mkdir "%BASE%\CodeJudge.Domain\ValueObjects" >nul 2>nul
mkdir "%BASE%\CodeJudge.Domain\Enums" >nul 2>nul
mkdir "%BASE%\CodeJudge.Domain\Events" >nul 2>nul

REM Infrastructure
mkdir "%BASE%\CodeJudge.Infrastructure\Persistence\SqlServer\Configurations" >nul 2>nul
mkdir "%BASE%\CodeJudge.Infrastructure\Persistence\Mongo\Documents" >nul 2>nul
mkdir "%BASE%\CodeJudge.Infrastructure\Repositories\SqlServer" >nul 2>nul
mkdir "%BASE%\CodeJudge.Infrastructure\Repositories\Mongo" >nul 2>nul
mkdir "%BASE%\CodeJudge.Infrastructure\Runners\Models" >nul 2>nul

REM Node Runner (JS)
mkdir "%BASE%\CodeJudge.Runner.Node\src\routes" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\src\controllers" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\src\services" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\src\runners" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\src\languages" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\src\validators" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\src\contracts" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\src\utils" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\src\config" >nul 2>nul
mkdir "%BASE%\CodeJudge.Runner.Node\test" >nul 2>nul

REM ---------------------------
REM Create placeholder files (only if not exist)
REM ---------------------------

call :Touch "%BASE%\CodeJudge.API\Controllers\ProblemsController.cs"
call :Touch "%BASE%\CodeJudge.API\Controllers\TestCasesController.cs"
call :Touch "%BASE%\CodeJudge.API\Controllers\SubmissionsController.cs"
call :Touch "%BASE%\CodeJudge.API\Controllers\JudgeController.cs"
call :Touch "%BASE%\CodeJudge.API\Controllers\LanguagesController.cs"

call :Touch "%BASE%\CodeJudge.API\Middlewares\ExceptionHandlingMiddleware.cs"
call :Touch "%BASE%\CodeJudge.API\Middlewares\CorrelationIdMiddleware.cs"

call :Touch "%BASE%\CodeJudge.API\Extensions\DependencyInjection.cs"
call :Touch "%BASE%\CodeJudge.API\Extensions\SwaggerExtensions.cs"
call :Touch "%BASE%\CodeJudge.API\Extensions\AuthExtensions.cs"

REM Application interfaces
call :Touch "%BASE%\CodeJudge.Application\Interfaces\IUnitOfWork.cs"
call :Touch "%BASE%\CodeJudge.Application\Interfaces\ICodeRunnerClient.cs"

call :Touch "%BASE%\CodeJudge.Application\Interfaces\Repositories\IProblemRepository.cs"
call :Touch "%BASE%\CodeJudge.Application\Interfaces\Repositories\ITestCaseRepository.cs"
call :Touch "%BASE%\CodeJudge.Application\Interfaces\Repositories\ILanguageRepository.cs"
call :Touch "%BASE%\CodeJudge.Application\Interfaces\Repositories\ISubmissionRepository.cs"
call :Touch "%BASE%\CodeJudge.Application\Interfaces\Repositories\IJudgeResultRepository.cs"
call :Touch "%BASE%\CodeJudge.Application\Interfaces\Repositories\IExecutionLogRepository.cs"

REM DTOs
call :Touch "%BASE%\CodeJudge.Application\DTOs\ProblemDto.cs"
call :Touch "%BASE%\CodeJudge.Application\DTOs\TestCaseDto.cs"
call :Touch "%BASE%\CodeJudge.Application\DTOs\SubmissionDto.cs"
call :Touch "%BASE%\CodeJudge.Application\DTOs\JudgeResultDto.cs"
call :Touch "%BASE%\CodeJudge.Application\DTOs\LanguageDto.cs"

REM Features placeholders
call :Touch "%BASE%\CodeJudge.Application\Features\Submissions\Commands\CreateSubmissionCommand.cs"
call :Touch "%BASE%\CodeJudge.Application\Features\Submissions\Commands\RejudgeSubmissionCommand.cs"
call :Touch "%BASE%\CodeJudge.Application\Features\Submissions\Commands\CancelSubmissionCommand.cs"
call :Touch "%BASE%\CodeJudge.Application\Features\Submissions\Queries\GetSubmissionByIdQuery.cs"
call :Touch "%BASE%\CodeJudge.Application\Features\Submissions\Queries\ListSubmissionsQuery.cs"

REM Services/Common/Validation
call :Touch "%BASE%\CodeJudge.Application\Services\JudgeOrchestrator.cs"
call :Touch "%BASE%\CodeJudge.Application\Services\VerdictCalculator.cs"
call :Touch "%BASE%\CodeJudge.Application\Common\Result.cs"
call :Touch "%BASE%\CodeJudge.Application\Common\PagedResult.cs"
call :Touch "%BASE%\CodeJudge.Application\Common\Errors.cs"
call :Touch "%BASE%\CodeJudge.Application\Validation\CreateSubmissionValidator.cs"
call :Touch "%BASE%\CodeJudge.Application\Validation\CreateProblemValidator.cs"

REM Domain
call :Touch "%BASE%\CodeJudge.Domain\Entities\Problem.cs"
call :Touch "%BASE%\CodeJudge.Domain\Entities\TestCase.cs"
call :Touch "%BASE%\CodeJudge.Domain\Entities\Language.cs"
call :Touch "%BASE%\CodeJudge.Domain\Entities\Submission.cs"
call :Touch "%BASE%\CodeJudge.Domain\Entities\JudgeResult.cs"

call :Touch "%BASE%\CodeJudge.Domain\ValueObjects\TimeLimit.cs"
call :Touch "%BASE%\CodeJudge.Domain\ValueObjects\MemoryLimit.cs"
call :Touch "%BASE%\CodeJudge.Domain\ValueObjects\RuntimeConstraints.cs"

call :Touch "%BASE%\CodeJudge.Domain\Enums\SubmissionStatus.cs"
call :Touch "%BASE%\CodeJudge.Domain\Enums\JudgeVerdict.cs"

call :Touch "%BASE%\CodeJudge.Domain\Events\SubmissionCreatedDomainEvent.cs"
call :Touch "%BASE%\CodeJudge.Domain\Events\SubmissionJudgedDomainEvent.cs"

REM Infrastructure
call :Touch "%BASE%\CodeJudge.Infrastructure\Persistence\SqlServer\JudgeDbContext.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Persistence\SqlServer\Configurations\ProblemConfiguration.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Persistence\SqlServer\Configurations\TestCaseConfiguration.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Persistence\SqlServer\Configurations\LanguageConfiguration.cs"

call :Touch "%BASE%\CodeJudge.Infrastructure\Persistence\Mongo\MongoContext.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Persistence\Mongo\Documents\SubmissionDocument.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Persistence\Mongo\Documents\JudgeResultDocument.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Persistence\Mongo\Documents\ExecutionLogDocument.cs"

call :Touch "%BASE%\CodeJudge.Infrastructure\Repositories\SqlServer\ProblemRepository.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Repositories\SqlServer\TestCaseRepository.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Repositories\SqlServer\LanguageRepository.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Repositories\SqlServer\UnitOfWork.cs"

call :Touch "%BASE%\CodeJudge.Infrastructure\Repositories\Mongo\SubmissionRepository.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Repositories\Mongo\JudgeResultRepository.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Repositories\Mongo\ExecutionLogRepository.cs"

call :Touch "%BASE%\CodeJudge.Infrastructure\Runners\NodeRunnerClient.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Runners\Models\RunRequest.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\Runners\Models\RunResponse.cs"
call :Touch "%BASE%\CodeJudge.Infrastructure\DependencyInjection.cs"

REM Node Runner JS files
call :Touch "%BASE%\CodeJudge.Runner.Node\src\server.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\routes\run.routes.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\controllers\run.controller.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\services\judge.service.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\services\compile.service.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\runners\docker.runner.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\runners\process.runner.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\runners\sandbox.policy.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\languages\cpp.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\languages\csharp.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\languages\javascript.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\languages\python.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\validators\runRequest.validator.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\contracts\runRequest.schema.json"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\contracts\runResult.schema.json"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\utils\fs.util.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\utils\hash.util.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\utils\time.util.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\config\env.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\src\config\constants.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\test\run.e2e.test.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\test\sandbox.policy.test.js"
call :Touch "%BASE%\CodeJudge.Runner.Node\Dockerfile"
call :Touch "%BASE%\CodeJudge.Runner.Node\README.md"
call :Touch "%BASE%\CodeJudge.Runner.Node\.env.example"
call :Touch "%BASE%\CodeJudge.Runner.Node\.eslintrc.json"
call :Touch "%BASE%\CodeJudge.Runner.Node\package.json"

echo.
echo DONE. Created folders/files to match required structure.
echo You can verify with:  tree "%BASE%\CodeJudge.API" /F
echo.
exit /b 0

:Touch
set F=%~1
if not exist "%F%" (
  echo.>"%F%"
)
exit /b 0
