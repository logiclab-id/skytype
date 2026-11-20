import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const rootDir = process.cwd();
const projectPath = path.join("apps", "api", "api.csproj");
const migrationsDir = path.join(rootDir, "apps", "api", "migrations");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const hasMigrations =
  existsSync(migrationsDir) &&
  readdirSync(migrationsDir).some((file) => file.endsWith(".cs"));

if (!hasMigrations) {
  console.log("No EF Core migrations found. Creating InitialCreate...");
  run("dotnet", [
    "ef",
    "migrations",
    "add",
    "InitialCreate",
    "--project",
    projectPath,
    "--output-dir",
    "migrations",
  ]);
}

console.log("Applying EF Core migrations to database...");
run("dotnet", ["ef", "database", "update", "--project", projectPath]);
console.log("Database migration complete.");
