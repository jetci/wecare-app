const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.test.tsx')) {
      processFile(full);
    }
  });
}

function processFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const out = [];
  let seenCanonical = false;
  for (let line of lines) {
    // skip any relative test-utils import
    if (/from\s+['"][\.\/]*test-utils['"]/.test(line)) continue;
    // skip direct testing-library imports
    if (/from\s+['"]@testing-library\/react['"]/.test(line)) continue;
    // keep only first canonical import
    if (!seenCanonical && /from\s+['"]@\/app\/dashboard\/test-utils['"]/.test(line)) {
      out.push(line);
      seenCanonical = true;
      continue;
    }
    // skip subsequent canonical imports
    if (seenCanonical && /from\s+['"]@\/app\/dashboard\/test-utils['"]/.test(line)) {
      continue;
    }
    out.push(line);
  }
  fs.writeFileSync(file, out.join('\n'), 'utf8');
  console.log(`Deduped imports in ${file}`);
}

// run for dashboard and profile
walk(path.join(__dirname, 'src', 'app', 'dashboard'));
walk(path.join(__dirname, 'src', 'app', 'profile'));
console.log('Deduplication complete');
