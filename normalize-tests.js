const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && full.endsWith('.test.tsx')) {
      processFile(full);
    }
  }
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const filtered = [];
  let canonicalImportFound = false;

  for (let line of lines) {
    // Remove direct testing-library imports
    if (/import\s+\{[^}]*\}\s+from\s+['\"]@testing-library\/react['\"]/.test(line)) continue;
    // Skip old relative test-utils imports
    if (/from\s+['\"].*\.\.\/+test-utils['\"]/.test(line)) continue;
    // Insert canonical import once at top
    if (!canonicalImportFound && /import\s+React/.test(line)) {
      filtered.push(line);
      filtered.push(
        "import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved } from '@/app/dashboard/test-utils'"
      );
      canonicalImportFound = true;
      continue;
    }
    filtered.push(line);
  }

  fs.writeFileSync(file, filtered.join('\n'), 'utf8');
  console.log(`Normalized ${file}`);
}

// Run for both dashboard and profile
walk(path.join(__dirname, 'src', 'app', 'dashboard'));
walk(path.join(__dirname, 'src', 'app', 'profile'));
console.log('Normalization complete');
