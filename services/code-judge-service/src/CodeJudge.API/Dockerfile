FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["src/CodeJudge.API/CodeJudge.API.csproj", "src/CodeJudge.API/"]
COPY ["src/CodeJudge.Application/CodeJudge.Application.csproj", "src/CodeJudge.Application/"]
COPY ["src/CodeJudge.Domain/CodeJudge.Domain.csproj", "src/CodeJudge.Domain/"]
COPY ["src/CodeJudge.Infrastructure/CodeJudge.Infrastructure.csproj", "src/CodeJudge.Infrastructure/"]

RUN dotnet restore "./src/CodeJudge.API/CodeJudge.API.csproj"

COPY . .
WORKDIR "/src/src/CodeJudge.API"
RUN dotnet build "./CodeJudge.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./CodeJudge.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CodeJudge.API.dll"]