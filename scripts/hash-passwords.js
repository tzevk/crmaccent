const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// Example usage - run this to generate hashed passwords for your users
async function generateHashes() {
  const passwords = ['password123', 'admin123', 'user123'];
  
  for (const password of passwords) {
    const hash = await hashPassword(password);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
}

generateHashes();
