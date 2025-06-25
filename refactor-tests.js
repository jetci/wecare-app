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
  text = text.replace(/import\s*\{[^\}]*\}\s*from\s*'\.\.\/test-utils'/g,
    "import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved } from '@/app/dashboard/test-utils'");
  text = text.replace(/"executive"/g, 'Role.EXECUTIVE');
  text = text.replace(/import\s+(\w+)\s+from\s+'(\.\.\/ui\/\w+)'/g,
    "import { $1 } from '$2'");
  text = text.replace(/handleAction\(([^,]+),\s*null\)/g,
    'handleAction($1, undefined)');
  fs.writeFileSync(file, text, 'utf8');
  console.log(`Processed ${file}`);
}

// run for dashboard and profile
walk(path.join(__dirname, 'src', 'app', 'dashboard'));
walk(path.join(__dirname, 'src', 'app', 'profile'));

// Additional cleanup: remove direct testing-library imports and rename renderWithProviders calls
const testFiles = [];
function collect(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) collect(full);
    else if (full.endsWith('.test.tsx')) testFiles.push(full);
  });
}
collect(path.join(__dirname, 'src', 'app', 'dashboard'));
collect(path.join(__dirname, 'src', 'app', 'profile'));

testFiles.forEach(file => {
  let txt = fs.readFileSync(file, 'utf8');
  // remove imports from @testing-library/react
  txt = txt.replace(/^import \{[^}]*\} from '@testing-library\/react';\n?/gm, '');
  // replace renderWithProviders -> render
  txt = txt.replace(/renderWithProviders\(/g, 'render(');
  fs.writeFileSync(file, txt, 'utf8');
  console.log(`Cleaned ${file}`);
});

console.log('Refactoring complete');
