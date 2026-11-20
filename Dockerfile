FROM oven/bun:1 AS web-build
WORKDIR /web

COPY apps/web/package.json ./
RUN bun install

COPY apps/web/ ./
RUN bun run build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
WORKDIR /api

COPY apps/api/api.csproj ./
RUN dotnet restore api.csproj

COPY apps/api/ ./
RUN dotnet publish api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

COPY --from=api-build /app/publish ./
COPY --from=web-build /web/dist ./wwwroot

ENTRYPOINT ["dotnet", "api.dll"]
