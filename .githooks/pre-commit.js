const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const protectedFilesConfig = path.join(process.cwd(), '.protected-files');

if (!fs.existsSync(protectedFilesConfig)) {
    process.exit(0);
}

const protectedFiles = fs.readFileSync(protectedFilesConfig, 'utf8').split(/\r?\n/).filter(Boolean);

let deletedFiles = '';
try {
    deletedFiles = execSync('git diff --cached --name-only --diff-filter=D', { encoding: 'utf8' });
} catch (error) {
    console.error('Error checking for deleted files:', error);
    process.exit(1);
}

const stagedDeletions = deletedFiles.split(/\r?\n/).filter(Boolean);
let isProtectedFileAffected = false;

stagedDeletions.forEach(file => {
    if (protectedFiles.includes(file)) {
        if (!isProtectedFileAffected) {
            console.error('\n🚨 การเปลี่ยนแปลงนี้กระทบไฟล์สำคัญของระบบ โปรดขออนุญาต SA ก่อนดำเนินการ');
            isProtectedFileAffected = true;
        }
        console.error(`   - พบการลบไฟล์: ${file}`);
    }
});

if (isProtectedFileAffected) {
    process.exit(1);
}

process.exit(0);
