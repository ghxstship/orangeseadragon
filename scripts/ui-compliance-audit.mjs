#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const APP_DIR = path.join(SRC_DIR, "app");
const OUTPUT_PATH = path.join(ROOT, "tmp_ui_audit.json");

const STANDARD_LAYOUT_WRAPPERS = [
  "CrudList",
  "CrudDetail",
  "AuthTemplate",
  "DashboardTemplate",
  "EntityListTemplate",
  "FormTemplate",
  "ReportsTemplate",
  "SettingsTemplate",
  "WizardTemplate",
  "ListLayout",
  "DetailLayout",
  "FormLayout",
  "DashboardLayout",
  "SplitLayout",
  "WorkspaceLayout",
  "SettingsLayout",
  "WizardLayout",
  "CanvasLayout",
  "DocumentLayout",
  "EmptyLayout",
  "ErrorLayout",
];

const WRAPPER_REGEX = new RegExp(
  `<(${STANDARD_LAYOUT_WRAPPERS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`
);

const PALETTE_COLORS = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
].join("|");

const PALETTE_CLASS_REGEX = new RegExp(
  `\\b(?:bg|text|border|ring|from|to|via|stroke|fill)-(?:${PALETTE_COLORS})-(?:[0-9]{2,3}|950)\\b`,
  "g"
);

const INLINE_STYLE_REGEX = /style=\{\{/g;
const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,8}\b/g;
const COLOR_FN_REGEX = /\b(?:rgb|rgba|hsl|hsla)\s*\(/g;
const NATIVE_CONTROL_REGEX = /<\s*(button|input|select|textarea)\b([^>]*)>/g;

const CONTROL_ALLOWLIST = [
  {
    file: "src/components/views/map-view.tsx",
    tag: "button",
    reason: "Map markers/clusters are absolute-positioned interactive overlays.",
  },
];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
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

function shouldIgnoreNativeControl(fileRel, tag, attrs) {
  if (fileRel.startsWith("src/components/ui/")) {
    return true;
  }

  for (const allowed of CONTROL_ALLOWLIST) {
    if (allowed.file === fileRel && allowed.tag === tag) {
      return true;
    }
  }

  if (tag === "input") {
    const hasFileType = /type\s*=\s*["']file["']/.test(attrs);
    const isHidden = /className\s*=\s*["'][^"']*\bhidden\b/.test(attrs);
    if (hasFileType && isHidden) {
      return true;
    }
  }

  return false;
}

async function main() {
  const strictMode = process.argv.includes("--strict");

  const tsxFiles = await walkFiles(SRC_DIR, (file) => file.endsWith(".tsx"));
  const cssFiles = await walkFiles(SRC_DIR, (file) => file.endsWith(".css"));
  const pageFiles = await walkFiles(APP_DIR, (file) => file.endsWith("/page.tsx"));

  const allLayoutCandidates = new Set();
  for (const pageFile of pageFiles) {
    let current = path.dirname(pageFile);
    while (current.startsWith(APP_DIR)) {
      allLayoutCandidates.add(path.join(current, "layout.tsx"));
      if (current === APP_DIR) break;
      current = path.dirname(current);
    }
  }

  const layoutExistenceCache = new Map();
  for (const candidate of allLayoutCandidates) {
    // eslint-disable-next-line no-await-in-loop
    layoutExistenceCache.set(candidate, await exists(candidate));
  }

  const layoutStats = {
    total_pages: pageFiles.length,
    pages_using_standard_wrapper: 0,
    pages_with_route_layout_contract: 0,
    pages_without_layout_contract: 0,
    wrapper_usage: Object.fromEntries(STANDARD_LAYOUT_WRAPPERS.map((w) => [w, 0])),
    without_layout_contract_files: [],
  };

  for (const pageFile of pageFiles) {
    const source = await readFileSafe(pageFile);
    const fileRel = toPosix(path.relative(ROOT, pageFile));

    const wrapperMatches = [...source.matchAll(new RegExp(WRAPPER_REGEX, "g"))].map((m) => m[1]);
    if (wrapperMatches.length > 0) {
      layoutStats.pages_using_standard_wrapper += 1;
      for (const wrapper of new Set(wrapperMatches)) {
        layoutStats.wrapper_usage[wrapper] += 1;
      }
      continue;
    }

    let hasLayoutContract = false;
    let current = path.dirname(pageFile);
    while (current.startsWith(APP_DIR)) {
      const candidate = path.join(current, "layout.tsx");
      if (layoutExistenceCache.get(candidate)) {
        hasLayoutContract = true;
        break;
      }
      if (current === APP_DIR) break;
      current = path.dirname(current);
    }

    if (hasLayoutContract) {
      layoutStats.pages_with_route_layout_contract += 1;
    } else {
      layoutStats.pages_without_layout_contract += 1;
      layoutStats.without_layout_contract_files.push(fileRel);
    }
  }

  const hardcoded = {
    palette_class_occurrences: 0,
    palette_class_files: new Set(),
    inline_style_occurrences: 0,
    inline_style_files: new Set(),
    native_control_occurrences: 0,
    native_control_files: new Set(),
    literal_color_occurrences: 0,
    literal_color_files: new Set(),
  };

  const fileIssueCounts = new Map();

  const allowedLiteralFiles = new Set([
    toPosix(path.relative(ROOT, path.join(SRC_DIR, "app/globals.css"))),
    toPosix(path.relative(ROOT, path.join(ROOT, "tailwind.config.ts"))),
    toPosix(path.relative(ROOT, path.join(SRC_DIR, "lib/tokens/semantic-colors.ts"))),
  ]);

  for (const file of tsxFiles) {
    const source = await readFileSafe(file);
    const fileRel = toPosix(path.relative(ROOT, file));

    const paletteMatches = source.match(PALETTE_CLASS_REGEX) ?? [];
    if (paletteMatches.length > 0) {
      hardcoded.palette_class_occurrences += paletteMatches.length;
      hardcoded.palette_class_files.add(fileRel);
      fileIssueCounts.set(fileRel, (fileIssueCounts.get(fileRel) ?? 0) + paletteMatches.length);
    }

    const inlineMatches = source.match(INLINE_STYLE_REGEX) ?? [];
    if (inlineMatches.length > 0) {
      hardcoded.inline_style_occurrences += inlineMatches.length;
      hardcoded.inline_style_files.add(fileRel);
      fileIssueCounts.set(fileRel, (fileIssueCounts.get(fileRel) ?? 0) + inlineMatches.length);
    }

    let nativeCount = 0;
    for (const match of source.matchAll(NATIVE_CONTROL_REGEX)) {
      const tag = match[1];
      const attrs = match[2] || "";
      if (!shouldIgnoreNativeControl(fileRel, tag, attrs)) {
        nativeCount += 1;
      }
    }

    if (nativeCount > 0) {
      hardcoded.native_control_occurrences += nativeCount;
      hardcoded.native_control_files.add(fileRel);
      fileIssueCounts.set(fileRel, (fileIssueCounts.get(fileRel) ?? 0) + nativeCount);
    }

    if (!allowedLiteralFiles.has(fileRel)) {
      const literalMatches = source.match(HEX_COLOR_REGEX) ?? [];
      if (literalMatches.length > 0) {
        hardcoded.literal_color_occurrences += literalMatches.length;
        hardcoded.literal_color_files.add(fileRel);
        fileIssueCounts.set(fileRel, (fileIssueCounts.get(fileRel) ?? 0) + literalMatches.length);
      }
    }
  }

  for (const file of cssFiles) {
    const source = await readFileSafe(file);
    const fileRel = toPosix(path.relative(ROOT, file));

    if (allowedLiteralFiles.has(fileRel)) {
      continue;
    }

    const literalMatches = [
      ...(source.match(HEX_COLOR_REGEX) ?? []),
      ...(source.match(COLOR_FN_REGEX) ?? []),
    ];

    if (literalMatches.length > 0) {
      hardcoded.literal_color_occurrences += literalMatches.length;
      hardcoded.literal_color_files.add(fileRel);
      fileIssueCounts.set(fileRel, (fileIssueCounts.get(fileRel) ?? 0) + literalMatches.length);
    }
  }

  const issueFiles = new Set([
    ...hardcoded.palette_class_files,
    ...hardcoded.inline_style_files,
    ...hardcoded.native_control_files,
    ...hardcoded.literal_color_files,
    ...layoutStats.without_layout_contract_files,
  ]);

  const topOffenders = [...fileIssueCounts.entries()]
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, 30);

  const result = {
    meta: {
      generated_at: new Date().toISOString(),
      total_page_files: pageFiles.length,
      total_tsx_files: tsxFiles.length,
      total_css_files: cssFiles.length,
      strict_mode: strictMode,
    },
    layout_normalization: {
      total_pages: layoutStats.total_pages,
      pages_using_standard_wrapper: layoutStats.pages_using_standard_wrapper,
      pages_with_route_layout_contract: layoutStats.pages_with_route_layout_contract,
      pages_without_layout_contract: layoutStats.pages_without_layout_contract,
      wrapper_usage: Object.fromEntries(
        Object.entries(layoutStats.wrapper_usage).filter(([, count]) => count > 0)
      ),
      without_layout_contract_files: layoutStats.without_layout_contract_files,
    },
    hardcoded_ui: {
      palette_class_occurrences: hardcoded.palette_class_occurrences,
      palette_class_files: hardcoded.palette_class_files.size,
      inline_style_occurrences: hardcoded.inline_style_occurrences,
      inline_style_files: hardcoded.inline_style_files.size,
      native_control_occurrences: hardcoded.native_control_occurrences,
      native_control_files: hardcoded.native_control_files.size,
      literal_color_occurrences: hardcoded.literal_color_occurrences,
      literal_color_files: hardcoded.literal_color_files.size,
    },
    compliance: {
      issue_occurrences_total:
        hardcoded.palette_class_occurrences +
        hardcoded.inline_style_occurrences +
        hardcoded.native_control_occurrences +
        hardcoded.literal_color_occurrences +
        layoutStats.pages_without_layout_contract,
      files_with_any_issue: issueFiles.size,
      top_offenders: topOffenders,
    },
    exceptions: {
      native_control_allowlist: CONTROL_ALLOWLIST,
    },
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  const hardcodedTotal =
    result.hardcoded_ui.palette_class_occurrences +
    result.hardcoded_ui.inline_style_occurrences +
    result.hardcoded_ui.native_control_occurrences +
    result.hardcoded_ui.literal_color_occurrences;

  console.log(`wrote ${toPosix(path.relative(ROOT, OUTPUT_PATH))}`);
  console.log(
    JSON.stringify(
      {
        pages_without_layout_contract: result.layout_normalization.pages_without_layout_contract,
        hardcoded_occurrences_total: hardcodedTotal,
        compliance_issue_occurrences_total: result.compliance.issue_occurrences_total,
        files_with_any_issue: result.compliance.files_with_any_issue,
      },
      null,
      2
    )
  );

  if (strictMode && result.compliance.issue_occurrences_total > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
