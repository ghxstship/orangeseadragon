// /migration/validate-3nf.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 3NF VALIDATION SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Run this to validate codebase follows 3NF principles.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { informationArchitecture } from '../src/lib/navigation/ia-structure';

interface ValidationResult {
  passed: boolean;
  violations: {
    rule: string;
    file: string;
    line?: number;
    description: string;
  }[];
}

async function validate3NF(): Promise<ValidationResult> {
  const violations: ValidationResult['violations'] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 1: No duplicate entity pages
  // ─────────────────────────────────────────────────────────────────────────
  const pageFiles = await glob('src/app/**/page.tsx');
  const entityPageMap = new Map<string, string[]>();

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Extract schema import
    const schemaMatch = content.match(/import.*from\s+['"]@\/schemas\/(\w+)\.schema['"]/);
    if (schemaMatch) {
      const entity = schemaMatch[1];
      if (!entityPageMap.has(entity)) {
        entityPageMap.set(entity, []);
      }
      entityPageMap.get(entity)!.push(file);
    }
  }

  for (const [entity, pages] of Array.from(entityPageMap)) {
    if (pages.length > 1) {
      // Allow /entity, /entity/[id], /entity/new, /entity/[id]/edit
      const basePaths = pages.map(p => p.replace(/\/\[.*?\]/g, '').replace('/new', '').replace('/edit', ''));
      const uniqueBasePaths = [...new Set(basePaths)];

      if (uniqueBasePaths.length > 1) {
        violations.push({
          rule: '1NF: No duplicate entity pages',
          file: pages.join(', '),
          description: `Entity "${entity}" has multiple base pages: ${uniqueBasePaths.join(', ')}`,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 2: No stored computed values in schemas
  // ─────────────────────────────────────────────────────────────────────────
  const schemaFiles = await glob('src/schemas/*.schema.ts');

  const computedPatterns = [
    /count:\s*number/,           // Stored count
    /total:\s*number/,           // Stored total
    /average:\s*number/,         // Stored average
    /daysUntil:\s*number/,       // Stored computed date diff
    /isOverdue:\s*boolean/,      // Stored computed boolean
    /displayName:\s*string/,     // Stored computed string
  ];

  for (const file of schemaFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Check if these are in data.fields (stored) vs data.computed (derived)
    const fieldsMatch = content.match(/fields:\s*\{([^}]*)\}/);
    if (fieldsMatch) {
      const fieldsContent = fieldsMatch[1];

      for (const pattern of computedPatterns) {
        if (pattern.test(fieldsContent)) {
          violations.push({
            rule: '3NF: No stored computed values',
            file,
            description: `Schema stores computed value matching pattern: ${pattern}`,
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 3: No redundant data fetching
  // ─────────────────────────────────────────────────────────────────────────
  const componentFiles = await glob('src/**/*.tsx', { ignore: ['node_modules/**'] });

  const fetchPatterns = new Map<string, string[]>();

  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Find all API fetches
    const fetchMatches = content.matchAll(/fetch\(['"`](\/api\/[^'"]+)['"`]\)/g);
    const fetchMatchesArray = Array.from(fetchMatches);

    for (const match of fetchMatchesArray) {
      const endpoint = match[1];
      if (!fetchPatterns.has(endpoint)) {
        fetchPatterns.set(endpoint, []);
      }
      fetchPatterns.get(endpoint)!.push(file);
    }
  }

  // Check for same endpoint fetched in multiple unrelated components
  // (This is a heuristic - may have false positives)
  for (const endpoint of Array.from(fetchPatterns.keys())) {
    const files = fetchPatterns.get(endpoint) || [];
    // Ignore if all files are in same directory (likely related)
    const directories = files.map(f => path.dirname(f));
    const uniqueDirs = Array.from(new Set(directories));

    if (uniqueDirs.length > 3) {  // Arbitrary threshold
      violations.push({
        rule: '3NF: Potential redundant data fetching',
        file: files.slice(0, 3).join(', ') + (files.length > 3 ? '...' : ''),
        description: `Endpoint "${endpoint}" fetched in ${files.length} different locations`,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 4: No hardcoded navigation
  // ─────────────────────────────────────────────────────────────────────────
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Skip the IA definition files
    if (file.includes('ia-structure') || file.includes('navigation')) continue;

    // Check for hardcoded hrefs that should use IA
    const hardcodedLinks = content.matchAll(/href=["']\/([a-z-]+)["']/g);
    const hardcodedLinksArray = Array.from(hardcodedLinks);

    for (const match of hardcodedLinksArray) {
      const path = match[1];

      // Check if this path is in IA structure
      const isInIA = Object.values(informationArchitecture.pages)
        .some((p: { path: string }) => p.path === `/${path}` || p.path.startsWith(`/${path}/`));

      if (!isInIA) {
        violations.push({
          rule: 'SSOT: Hardcoded navigation link',
          file,
          description: `Hardcoded link "/${path}" not found in IA structure`,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RULE 5: No duplicate sidebar definitions
  // ─────────────────────────────────────────────────────────────────────────
  const sidebarMatches = await glob('src/**/*sidebar*', { ignore: ['node_modules/**'] });

  if (sidebarMatches.length > 2) {  // Allow Sidebar.tsx and ia-structure.ts
    violations.push({
      rule: 'SSOT: Multiple sidebar definitions',
      file: sidebarMatches.join(', '),
      description: 'Multiple sidebar-related files found. Should have single source.',
    });
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

// Run validation
validate3NF().then(result => {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('3NF VALIDATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (result.passed) {
    console.log('✅ All validations passed!\n');
  } else {
    console.log(`❌ Found ${result.violations.length} violations:\n`);

    result.violations.forEach((v, i) => {
      console.log(`${i + 1}. [${v.rule}]`);
      console.log(`   File: ${v.file}`);
      console.log(`   Issue: ${v.description}\n`);
    });
  }
});
