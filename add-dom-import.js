#!/usr/bin/env node
// add-dom-import.js
// สคริปต์เพิ่ม import '@testing-library/jest-dom/vitest'; ในไฟล์ทดสอบที่ยังไม่มี

const fs = require('fs').promises;
const path = require('path');

// โฟลเดอร์โปรเจกต์หลัก
const rootDir = path.resolve(__dirname);
const exts = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];
const importLine = "import '@testing-library/jest-dom/vitest';";

async function findFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findFiles(full));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

(async () => {
  const files = await findFiles(rootDir);
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    if (!content.startsWith(importLine)) {
      await fs.writeFile(file, importLine + '\n' + content, 'utf8');
      console.log(`Added import to ${path.relative(rootDir, file)}`);
    }
  }
  console.log('Done adding imports.');
})();
