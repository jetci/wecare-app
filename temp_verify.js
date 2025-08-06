const bcrypt = require('bcryptjs');

const hash = '$2b$10$96HI1moZCZMcWuJ8.Xm.zOrL8qHR1zDWMJjgmySMOcwwqrBecNbvi';
const passwordToTest = '123456';

try {
  const isMatch = bcrypt.compareSync(passwordToTest, hash);
  console.log(`Password '123456' matches the hash: ${isMatch}`);
} catch (e) {
  console.error('Error comparing hash:', e);
}
