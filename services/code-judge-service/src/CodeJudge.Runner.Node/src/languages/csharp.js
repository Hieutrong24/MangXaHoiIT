
module.exports = function csharp() {
  return {
    sourceFile: "Program.cs",
    extraFiles: {
      "CodeJudge.csproj": [
        "<Project Sdk=\"Microsoft.NET.Sdk\">",
        "  <PropertyGroup>",
        "    <OutputType>Exe</OutputType>",
        "    <TargetFramework>net8.0</TargetFramework>",
        "    <ImplicitUsings>disable</ImplicitUsings>",
        "    <Nullable>disable</Nullable>",
        "    <LangVersion>latest</LangVersion>",
        "  </PropertyGroup>",
        "</Project>"
      ].join("\n")
    },
    compile: {
      cmd: "dotnet",
      args: ["build", "CodeJudge.csproj", "-c", "Release", "-o", "out", "--nologo", "/p:UseAppHost=false"]
    },
    run: { cmd: "dotnet", args: ["out/CodeJudge.dll"] },
    compileTimeoutMs: 60000,
    compileMemLimitMb: 512
  };
};
