const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const protectedFilesConfig = path.join(process.cwd(), '.protected-files');

if (!fs.existsSync(protectedFilesConfig)) {
    process.exit(0);
}

const protectedFiles = fs.readFileSync(protectedFilesConfig, 'utf8').split(/\r?\n/).filter(Boolean);

const sourceRef = process.argv[2];
const destRef = process.argv[3];
const isBranchCheckout = process.argv[4] === '1';

if (!isBranchCheckout) {
    process.exit(0);
}

try {
    const filesInCurrentBranch = execSync('git ls-files', { encoding: 'utf8' }).split(/\r?\n/);
    const filesInTargetBranch = execSync(`git ls-tree -r --name-only ${destRef}`, { encoding: 'utf8' }).split(/\r?\n/);

    let isProtectedFileAffected = false;

    protectedFiles.forEach(protectedFile => {
        const existsInCurrent = filesInCurrentBranch.includes(protectedFile);
        const existsInTarget = filesInTargetBranch.includes(protectedFile);

        if (existsInCurrent && !existsInTarget) {
            if (!isProtectedFileAffected) {
                console.error('\n🚨 การเปลี่ยนแปลงนี้กระทบไฟล์สำคัญของระบบ โปรดขออนุญาต SA ก่อนดำเนินการ');
                isProtectedFileAffected = true;
            }
            console.error(`   - การ checkout นี้จะทำให้ไฟล์ '${protectedFile}' หายไป`);
        }
    });

    if (isProtectedFileAffected) {
        process.exit(1);
    }

} catch (error) {
    // If the target branch doesn't exist, git ls-tree will fail. We can ignore this.
    // console.error('Error during pre-checkout check:', error.message);
}

process.exit(0);
