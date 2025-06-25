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
  let text = fs.readFileSync(file, 'utf8');
  // Fix test-utils imports
  text = text.replace(/from\s+['"][\.\/]*test-utils['"]/g,
    "from '@/app/dashboard/test-utils'");
  // Remove any direct imports from testing-library/react
  text = text.replace(/import\s+\{[^\}]*\}\s+from\s+['"]@testing-library\/react['"];?\r?\n?/g, '');
  // Fix default imports from ui to named imports
  text = text.replace(/import\s+(\w+)\s+from\s+['"](\.\/[\.\.\/]*ui\/[\w-]+)['"]/g,
    "import { $1 } from '$2'");
  // Replace handleAction(..., null) -> undefined
  text = text.replace(/handleAction\(([^,]+),\s*null\)/g,
    'handleAction($1, undefined)');
  // Replace string enum
  text = text.replace(/"executive"/g, 'Role.EXECUTIVE');
  fs.writeFileSync(file, text, 'utf8');
  console.log(`Processed ${file}`);
}

// Run for dashboard and profile tests
walk(path.join(__dirname, 'src', 'app', 'dashboard'));
walk(path.join(__dirname, 'src', 'app', 'profile'));
console.log('Refactoring v3 complete');
