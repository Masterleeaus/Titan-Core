import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(root, "TitanCore_V1.9");
const inventoryPath = resolve(root, "docs/repository-hygiene.json");
const inventory = JSON.parse(readFileSync(inventoryPath, "utf8"));
const files = [];
const collisions = [];

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const byLowerName = new Map();

  for (const entry of entries) {
    const absolute = resolve(directory, entry.name);
    const path = relative(root, absolute).replaceAll("\\\\", "/");
    const sameName = byLowerName.get(entry.name.toLowerCase()) ?? [];
    sameName.push(path);
    byLowerName.set(entry.name.toLowerCase(), sameName);
    files.push({ path, name: entry.name });

    if (entry.isDirectory()) walk(absolute);
  }

  for (const group of byLowerName.values()) {
    if (group.length > 1) collisions.push(group.sort());
  }
}

if (!existsSync(sourceRoot)) {
  console.error("repository hygiene check: TitanCore_V1.9 is missing");
  process.exit(1);
}

walk(sourceRoot);

const collisionKey = (paths) => paths.map((path) => path.toLowerCase()).sort().join("|");
const approved = new Map(
  inventory.approved_case_collisions.map((item) => [collisionKey(item.paths), item]),
);
const unexpectedCollisions = collisions.filter((paths) => !approved.has(collisionKey(paths)));
const missingApproved = inventory.approved_case_collisions.filter((item) =>
  item.paths.some((path) => !existsSync(resolve(root, path))),
);
const metadataFiles = files.filter((file) => inventory.metadata_policy.includes(file.name));
const missingArtifacts = inventory.retained_artifacts.filter(
  (item) => !existsSync(resolve(root, item.path)),
);

if (unexpectedCollisions.length || missingApproved.length || metadataFiles.length || missingArtifacts.length) {
  if (unexpectedCollisions.length) {
    console.error("unexpected case collisions:", JSON.stringify(unexpectedCollisions));
  }
  if (missingApproved.length) {
    console.error("approved collision inventory is stale:", JSON.stringify(missingApproved));
  }
  if (metadataFiles.length) {
    console.error("OS metadata files found:", metadataFiles.map((file) => file.path).join(", "));
  }
  if (missingArtifacts.length) {
    console.error("retained artifact inventory is stale:", missingArtifacts.map((item) => item.path).join(", "));
  }
  process.exit(1);
}

console.log(
  "repository hygiene check: " + collisions.length + " approved case collisions; " +
    inventory.retained_artifacts.length + " retained binary artifacts; no unexpected metadata",
);
