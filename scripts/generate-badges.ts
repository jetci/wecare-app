import fs from 'fs';
import path from 'path';

// Paths to report files
const testReportPath = path.resolve(__dirname, '../report-community-tests.json');
const coverageReportPath = path.resolve(__dirname, '../coverage-summary.json'); // adjust if exists

function generateTestBadge() {
  if (!fs.existsSync(testReportPath)) return '';
  const report = JSON.parse(fs.readFileSync(testReportPath, 'utf-8'));
  const passed = report.numPassedTests || report.stats?.passes || 0;
  const total = report.numTotalTests || report.stats?.tests || 0;
  const color = passed === total ? 'brightgreen' : 'yellow';
  return `![Community Tests](${`https://img.shields.io/badge/Tests-${passed}%2F${total}-${color}`})`;
}

function generateCoverageBadge() {
  if (!fs.existsSync(coverageReportPath)) return '';
  const summary = JSON.parse(fs.readFileSync(coverageReportPath, 'utf-8'));
  const pct = Math.round(summary.total.lines.pct);
  const color = pct >= 90 ? 'brightgreen' : pct >= 75 ? 'yellow' : 'red';
  return `![Coverage](${`https://img.shields.io/badge/Coverage-${pct}%25-${color}`})`;
}

function updateReadme() {
  const readmePath = path.resolve(__dirname, '../README.md');
  let content = fs.readFileSync(readmePath, 'utf-8');
  const badgeSection = [generateTestBadge(), generateCoverageBadge()].filter(Boolean).join(' ');
  const newContent = content.replace(/<!-- BADGES_START -->([\s\S]*?)<!-- BADGES_END -->/,
    `<!-- BADGES_START -->\n${badgeSection}\n<!-- BADGES_END -->`);
  fs.writeFileSync(readmePath, newContent);
  console.log('README.md badges updated:', badgeSection);
}

updateReadme();
