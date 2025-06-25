const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith('.test.tsx')) processFile(full);
  });
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@\/types\/dashboard['"]/m;
  const match = content.match(importRegex);
  if (match) {
    const imports = match[1]
      .split(',')
      .map(i => i.trim().replace(/\[\]$/, ''))
      .filter(Boolean);
    const newImport = `import { ${imports.join(', ')} } from '@/types/dashboard'`;
    content = content.replace(importRegex, newImport);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed imports in ${file}`);
  }
}

['src/app/dashboard', 'src/app/profile'].forEach(dir => walk(path.join(__dirname, dir)));
console.log('Import array-types fix complete');
