#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const COMPONENTS_DIR = path.join(SRC_DIR, "components");
const OUTPUT_PATH = path.join(ROOT, "tmp_component_reference_audit.json");

const IMPORT_SPECIFIER_REGEX = /(?:import\s+(?:[^'\"]+from\s+)?|export\s+(?:\*|\{[^}]*\})\s+from\s+|import\s*\()\s*['\"]([^'\"]+)['\"]/g;

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

async function walkFiles(dirPath, predicate) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath, predicate)));
      continue;
    }

    if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function componentCandidatesFromBase(basePath) {
  return [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];
}

function resolveComponentFile(specifier, fromFile, componentFileSet) {
  let basePath = null;

  if (specifier.startsWith("@/")) {
    basePath = path.join(SRC_DIR, specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    basePath = path.resolve(path.dirname(fromFile), specifier);
  }

  if (!basePath) {
    return null;
  }

  for (const candidate of componentCandidatesFromBase(basePath)) {
    if (componentFileSet.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function main() {
  const strictMode = process.argv.includes("--strict");

  const codeFiles = await walkFiles(SRC_DIR, (file) => file.endsWith(".ts") || file.endsWith(".tsx"));
  const componentFiles = await walkFiles(COMPONENTS_DIR, (file) => file.endsWith(".tsx"));

  const componentFileSet = new Set(componentFiles.map((file) => path.resolve(file)));
  const referenceCount = new Map(componentFiles.map((file) => [path.resolve(file), 0]));

  for (const file of codeFiles) {
    const source = await readFileSafe(file);

    for (const match of source.matchAll(IMPORT_SPECIFIER_REGEX)) {
      const specifier = match[1];
      const resolved = resolveComponentFile(specifier, file, componentFileSet);

      if (!resolved) continue;

      referenceCount.set(resolved, (referenceCount.get(resolved) ?? 0) + 1);
    }
  }

  const fileStats = componentFiles
    .map((file) => {
      const resolved = path.resolve(file);
      return {
        file: toPosix(path.relative(ROOT, resolved)),
        references: referenceCount.get(resolved) ?? 0,
      };
    })
    .sort((a, b) => (a.references - b.references) || a.file.localeCompare(b.file));

  const singleUseFiles = fileStats.filter((entry) => entry.references === 1);
  const zeroReferenceFiles = fileStats.filter((entry) => entry.references === 0);

  const result = {
    generated_at: new Date().toISOString(),
    total_component_files: fileStats.length,
    single_use_count: singleUseFiles.length,
    zero_reference_count: zeroReferenceFiles.length,
    single_use_files: singleUseFiles,
    zero_reference_files: zeroReferenceFiles,
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  console.log(`wrote ${toPosix(path.relative(ROOT, OUTPUT_PATH))}`);
  console.log(
    JSON.stringify(
      {
        total_component_files: result.total_component_files,
        single_use_count: result.single_use_count,
        zero_reference_count: result.zero_reference_count,
      },
      null,
      2
    )
  );

  if (strictMode && result.zero_reference_count > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
