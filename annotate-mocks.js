const fs = require('fs');
const path = require('path');

const varTypeMap = {
  cacheData: 'CacheStats',
  jobsData: 'JobStats',
  stats: 'DeploymentStats',
  flagsData: 'DeploymentStats', // adjust as needed
  health: 'SystemHealth',
  history: 'HealthPoint[]',
  notifications: 'Notification[]',
  communities: 'Community[]',
  patients: 'Patient[]',
};

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith('.test.tsx')) processFile(full);
  });
}

function processFile(file) {
  let text = fs.readFileSync(file, 'utf8');
  let updated = false;

  // ensure import from '@/types/dashboard'
  if (!text.includes("@/types/dashboard")) {
    const allTypes = [...new Set(Object.values(varTypeMap).map(t => t.replace(/\[\]$/, '')))];
    text = text.replace(/(import.*['\"]react['\"].*\r?\n)/,
      `$1import { ${allTypes.join(', ')} } from '@/types/dashboard'\n`);
    updated = true;
  }

  // annotate mock vars
  for (const [varName, typeName] of Object.entries(varTypeMap)) {
    const regex = new RegExp(`const\\s+${varName}\\s*=`, 'g');
    const replacement = `const ${varName}: ${typeName} =`;
    if (regex.test(text)) {
      text = text.replace(regex, replacement);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(file, text, 'utf8');
    console.log(`Annotated mocks in ${file}`);
  }
}

// run on tests
['src/app/dashboard', 'src/app/profile'].forEach(dir => walk(path.join(__dirname, dir)));
console.log('Mock annotation complete');
