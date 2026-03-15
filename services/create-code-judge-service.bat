@echo off
setlocal enabledelayedexpansion

REM ==========================================================
REM  Create code-judge-service structure + dotnet projects + node runner (JS)
REM  Run this .bat from repository root (where "services\" exists)
REM ==========================================================

set ROOT=services\code-judge-service

echo [1/7] Create base folders...
if not exist "services" mkdir "services"
if not exist "%ROOT%" mkdir "%ROOT%"
pushd "%ROOT%"

REM base files
if not exist ".dockerignore" (
  echo bin/>>.dockerignore
  echo obj/>>.dockerignore
  echo .vs/>>.dockerignore
  echo node_modules/>>.dockerignore
)

if not exist "README.md" (
  echo # code-judge-service>README.md
)

REM docker-compose.yml (minimal placeholder; you can replace later)
if not exist "docker-compose.yml" (
  powershell -NoProfile -Command ^
    "$c=@'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=Your_password123
    ports:
      - \"14333:1433\"

  mongodb:
    image: mongo:7
    ports:
      - \"27018:27017\"

  runner:
    build:
      context: ./src/CodeJudge.Runner.Node
      dockerfile: Dockerfile
    environment:
      - PORT=5001
    ports:
      - \"5001:5001\"

  api:
    build:
      context: .
      dockerfile: ./src/CodeJudge.API/Dockerfile
    environment:
      - ASPNETCORE_URLS=http://+:8080
      - ConnectionStrings__SqlServer=Server=sqlserver,1433;Database=CodeJudgeDb;User Id=sa;Password=Your_password123;TrustServerCertificate=True;
      - Mongo__ConnectionString=mongodb://mongodb:27017
      - Mongo__Database=CodeJudge
      - Runner__BaseUrl=http://runner:5001
    ports:
      - \"8080:8080\"
    depends_on:
      - sqlserver
      - mongodb
      - runner
'@; Set-Content -Encoding UTF8 -Path 'docker-compose.yml' -Value $c"
)

echo [2/7] Create .NET solution + projects...
if not exist "CodeJudgeService.sln" (
  dotnet new sln -n CodeJudgeService
)

if not exist "src" mkdir "src"
pushd "src"

REM Create projects if not exist
if not exist "CodeJudge.API\CodeJudge.API.csproj" (
  dotnet new webapi -n CodeJudge.API --no-https
)
if not exist "CodeJudge.Application\CodeJudge.Application.csproj" (
  dotnet new classlib -n CodeJudge.Application
)
if not exist "CodeJudge.Domain\CodeJudge.Domain.csproj" (
  dotnet new classlib -n CodeJudge.Domain
)
if not exist "CodeJudge.Infrastructure\CodeJudge.Infrastructure.csproj" (
  dotnet new classlib -n CodeJudge.Infrastructure
)

popd

echo [3/7] Add projects to solution...
dotnet sln CodeJudgeService.sln add src\CodeJudge.API\CodeJudge.API.csproj >nul 2>nul
dotnet sln CodeJudgeService.sln add src\CodeJudge.Application\CodeJudge.Application.csproj >nul 2>nul
dotnet sln CodeJudgeService.sln add src\CodeJudge.Domain\CodeJudge.Domain.csproj >nul 2>nul
dotnet sln CodeJudgeService.sln add src\CodeJudge.Infrastructure\CodeJudge.Infrastructure.csproj >nul 2>nul

echo [4/7] Add project references + packages...
REM references
dotnet add src\CodeJudge.Application\CodeJudge.Application.csproj reference src\CodeJudge.Domain\CodeJudge.Domain.csproj >nul 2>nul
dotnet add src\CodeJudge.Infrastructure\CodeJudge.Infrastructure.csproj reference src\CodeJudge.Application\CodeJudge.Application.csproj >nul 2>nul
dotnet add src\CodeJudge.Infrastructure\CodeJudge.Infrastructure.csproj reference src\CodeJudge.Domain\CodeJudge.Domain.csproj >nul 2>nul
dotnet add src\CodeJudge.API\CodeJudge.API.csproj reference src\CodeJudge.Application\CodeJudge.Application.csproj >nul 2>nul
dotnet add src\CodeJudge.API\CodeJudge.API.csproj reference src\CodeJudge.Infrastructure\CodeJudge.Infrastructure.csproj >nul 2>nul

REM packages (ignore if already)
dotnet add src\CodeJudge.Infrastructure\CodeJudge.Infrastructure.csproj package Microsoft.EntityFrameworkCore --version 8.0.7 >nul 2>nul
dotnet add src\CodeJudge.Infrastructure\CodeJudge.Infrastructure.csproj package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.7 >nul 2>nul
dotnet add src\CodeJudge.Infrastructure\CodeJudge.Infrastructure.csproj package MongoDB.Driver --version 2.25.0 >nul 2>nul
dotnet add src\CodeJudge.API\CodeJudge.API.csproj package Swashbuckle.AspNetCore --version 6.6.2 >nul 2>nul
dotnet add src\CodeJudge.API\CodeJudge.API.csproj package Microsoft.EntityFrameworkCore.Design --version 8.0.7 >nul 2>nul

echo [5/7] Create folders according to your structure...
REM API folders
mkdir src\CodeJudge.API\Controllers >nul 2>nul
mkdir src\CodeJudge.API\Middlewares >nul 2>nul
mkdir src\CodeJudge.API\Extensions >nul 2>nul

REM Application folders
mkdir src\CodeJudge.Application\Interfaces\Repositories >nul 2>nul
mkdir src\CodeJudge.Application\DTOs >nul 2>nul
mkdir src\CodeJudge.Application\Features\Problems\Commands >nul 2>nul
mkdir src\CodeJudge.Application\Features\Problems\Queries >nul 2>nul
mkdir src\CodeJudge.Application\Features\TestCases\Commands >nul 2>nul
mkdir src\CodeJudge.Application\Features\TestCases\Queries >nul 2>nul
mkdir src\CodeJudge.Application\Features\Submissions\Commands >nul 2>nul
mkdir src\CodeJudge.Application\Features\Submissions\Queries >nul 2>nul
mkdir src\CodeJudge.Application\Services >nul 2>nul
mkdir src\CodeJudge.Application\Common >nul 2>nul
mkdir src\CodeJudge.Application\Validation >nul 2>nul

REM Domain folders
mkdir src\CodeJudge.Domain\Entities >nul 2>nul
mkdir src\CodeJudge.Domain\ValueObjects >nul 2>nul
mkdir src\CodeJudge.Domain\Enums >nul 2>nul
mkdir src\CodeJudge.Domain\Events >nul 2>nul

REM Infrastructure folders
mkdir src\CodeJudge.Infrastructure\Persistence\SqlServer\Configurations >nul 2>nul
mkdir src\CodeJudge.Infrastructure\Persistence\Mongo\Documents >nul 2>nul
mkdir src\CodeJudge.Infrastructure\Repositories\SqlServer >nul 2>nul
mkdir src\CodeJudge.Infrastructure\Repositories\Mongo >nul 2>nul
mkdir src\CodeJudge.Infrastructure\Runners\Models >nul 2>nul

echo [6/7] Create Node Runner (JavaScript) structure...
mkdir src\CodeJudge.Runner.Node\src\routes >nul 2>nul
mkdir src\CodeJudge.Runner.Node\src\controllers >nul 2>nul
mkdir src\CodeJudge.Runner.Node\src\services >nul 2>nul
mkdir src\CodeJudge.Runner.Node\src\runners >nul 2>nul
mkdir src\CodeJudge.Runner.Node\src\languages >nul 2>nul
mkdir src\CodeJudge.Runner.Node\src\validators >nul 2>nul
mkdir src\CodeJudge.Runner.Node\src\contracts >nul 2>nul
mkdir src\CodeJudge.Runner.Node\src\utils >nul 2>nul
mkdir src\CodeJudge.Runner.Node\src\config >nul 2>nul
mkdir src\CodeJudge.Runner.Node\test >nul 2>nul

REM Minimal Node files (JS)
if not exist "src\CodeJudge.Runner.Node\package.json" (
  powershell -NoProfile -Command ^
    "$c=@'
{
  \"name\": \"codejudge-runner\",
  \"version\": \"1.0.0\",
  \"main\": \"src/server.js\",
  \"type\": \"commonjs\",
  \"scripts\": { \"start\": \"node src/server.js\" },
  \"dependencies\": { \"express\": \"^4.19.2\" }
}
'@; Set-Content -Encoding UTF8 -Path 'src\CodeJudge.Runner.Node\package.json' -Value $c"
)

if not exist "src\CodeJudge.Runner.Node\Dockerfile" (
  powershell -NoProfile -Command ^
    "$c=@'
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i --omit=dev
COPY . .
EXPOSE 5001
CMD [\"node\",\"src/server.js\"]
'@; Set-Content -Encoding UTF8 -Path 'src\CodeJudge.Runner.Node\Dockerfile' -Value $c"
)

if not exist "src\CodeJudge.Runner.Node\src\server.js" (
  powershell -NoProfile -Command ^
    "$c=@'
const express = require(\"express\");
const runRoutes = require(\"./routes/run.routes\");

const app = express();
app.use(express.json({ limit: \"2mb\" }));

app.get(\"/health\", (_, res) => res.json({ ok: true }));
app.use(\"/\", runRoutes);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Runner listening on ${port}`));
'@; Set-Content -Encoding UTF8 -Path 'src\CodeJudge.Runner.Node\src\server.js' -Value $c"
)

if not exist "src\CodeJudge.Runner.Node\src\routes\run.routes.js" (
  powershell -NoProfile -Command ^
    "$c=@'
const router = require(\"express\").Router();
const { run } = require(\"../controllers/run.controller\");
router.post(\"/run\", run);
module.exports = router;
'@; Set-Content -Encoding UTF8 -Path 'src\CodeJudge.Runner.Node\src\routes\run.routes.js' -Value $c"
)

if not exist "src\CodeJudge.Runner.Node\src\controllers\run.controller.js" (
  powershell -NoProfile -Command ^
    "$c=@'
const { validateRunRequest } = require(\"../validators/runRequest.validator\");

async function run(req, res) {
  const err = validateRunRequest(req.body);
  if (err) return res.status(400).json({ error: err });

  // TODO: implement real judge later
  return res.json({
    verdict: \"AC\",
    compileLog: null,
    totalTimeMs: 1,
    peakMemoryKb: 0,
    tests: req.body.tests.map(t => ({
      index: t.index, verdict: \"AC\", timeMs: 1, memoryKb: 0, stdout: \"\", stderr: \"\"
    }))
  });
}

module.exports = { run };
'@; Set-Content -Encoding UTF8 -Path 'src\CodeJudge.Runner.Node\src\controllers\run.controller.js' -Value $c"
)

if not exist "src\CodeJudge.Runner.Node\src\validators\runRequest.validator.js" (
  powershell -NoProfile -Command ^
    "$c=@'
function validateRunRequest(body) {
  if (!body) return \"body required\";
  const { languageKey, sourceCode, timeLimitMs, memoryLimitMb, tests } = body;
  if (!languageKey || typeof languageKey !== \"string\") return \"languageKey required\";
  if (!sourceCode || typeof sourceCode !== \"string\") return \"sourceCode required\";
  if (!Number.isInteger(timeLimitMs) || timeLimitMs <= 0) return \"timeLimitMs invalid\";
  if (!Number.isInteger(memoryLimitMb) || memoryLimitMb <= 0) return \"memoryLimitMb invalid\";
  if (!Array.isArray(tests) || tests.length === 0) return \"tests required\";
  for (const t of tests) {
    if (!Number.isInteger(t.index) || t.index <= 0) return \"test.index invalid\";
    if (typeof t.input !== \"string\") return \"test.input invalid\";
    if (typeof t.expectedOutput !== \"string\") return \"test.expectedOutput invalid\";
  }
  return null;
}
module.exports = { validateRunRequest };
'@; Set-Content -Encoding UTF8 -Path 'src\CodeJudge.Runner.Node\src\validators\runRequest.validator.js' -Value $c"
)

echo [7/7] Create placeholder files for listed classes (empty)...
REM Create empty files to match your list (you can paste code later)
for %%F in (
  "src\CodeJudge.API\Controllers\ProblemsController.cs"
  "src\CodeJudge.API\Controllers\TestCasesController.cs"
  "src\CodeJudge.API\Controllers\SubmissionsController.cs"
  "src\CodeJudge.API\Controllers\JudgeController.cs"
  "src\CodeJudge.API\Controllers\LanguagesController.cs"
  "src\CodeJudge.API\Middlewares\ExceptionHandlingMiddleware.cs"
  "src\CodeJudge.API\Middlewares\CorrelationIdMiddleware.cs"
  "src\CodeJudge.API\Extensions\DependencyInjection.cs"
  "src\CodeJudge.API\Extensions\SwaggerExtensions.cs"
  "src\CodeJudge.API\Extensions\AuthExtensions.cs"
  "src\CodeJudge.API\appsettings.json"
  "src\CodeJudge.API\Dockerfile"
  "src\CodeJudge.Application\Interfaces\IUnitOfWork.cs"
  "src\CodeJudge.Application\Interfaces\ICodeRunnerClient.cs"
  "src\CodeJudge.Application\Common\Result.cs"
  "src\CodeJudge.Application\Common\PagedResult.cs"
  "src\CodeJudge.Application\Common\Errors.cs"
  "src\CodeJudge.Application\Services\JudgeOrchestrator.cs"
  "src\CodeJudge.Application\Services\VerdictCalculator.cs"
  "src\CodeJudge.Domain\Enums\SubmissionStatus.cs"
  "src\CodeJudge.Domain\Enums\JudgeVerdict.cs"
  "src\CodeJudge.Domain\Entities\Problem.cs"
  "src\CodeJudge.Domain\Entities\TestCase.cs"
  "src\CodeJudge.Domain\Entities\Language.cs"
  "src\CodeJudge.Domain\Events\SubmissionCreatedDomainEvent.cs"
  "src\CodeJudge.Domain\Events\SubmissionJudgedDomainEvent.cs"
  "src\CodeJudge.Infrastructure\DependencyInjection.cs"
  "src\CodeJudge.Infrastructure\Persistence\SqlServer\JudgeDbContext.cs"
  "src\CodeJudge.Infrastructure\Persistence\Mongo\MongoContext.cs"
  "src\CodeJudge.Infrastructure\Runners\NodeRunnerClient.cs"
) do (
  if not exist %%F (
    type nul > %%F
  )
)

popd
echo DONE. Folder structure created at: %ROOT%
echo Next: open solution CodeJudgeService.sln, then implement content for the placeholder files.
endlocal
