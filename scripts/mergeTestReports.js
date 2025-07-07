#!/usr/bin/env node
/**
 * สคริปต์นี้ใช้รวมไฟล์ JSON report จาก Vitest แล้วสรุปการทดสอบที่ล้มเหลว
 * Usage: node mergeTestReports.js report-community.json report-driver.json ...
 */
const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node mergeTestReports.js <report1.json> <report2.json> [...]');
  process.exit(1);
}

const reportFiles = process.argv.slice(2);
const failureMap = {}; // { filePath: { count: number, tests: [] } }

reportFiles.forEach((reportPath) => {
  try {
    const raw = fs.readFileSync(reportPath, 'utf-8');
    const data = JSON.parse(raw);
    const tests = data.tests || data.testResults || [];

    tests.forEach((test) => {
      if (test.status === 'fail' || test.state === 'failed') {
        const file = test.file || test.location?.file || 'unknown';
        const title = test.name || test.fullTitle || test.title;
        if (!failureMap[file]) {
          failureMap[file] = { count: 0, tests: [] };
        }
        failureMap[file].count += 1;
        failureMap[file].tests.push(title);
      }
    });
  } catch (e) {
    console.error(`Cannot process ${reportPath}:`, e.message);
  }
});

// แสดงผลเป็นตาราง
const summary = Object.entries(failureMap).map(([file, info]) => ({
  File: path.relative(process.cwd(), file),
  Failures: info.count,
  "Test Titles": info.tests.join('; '),
}));
console.table(summary);

// บันทึกสรุปเป็นไฟล์ถ้าต้องการ
const outPath = path.join(process.cwd(), 'merged-test-summary.json');
fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log(`Merged summary saved at ${outPath}`);
