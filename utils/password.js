const bcrypt = require('bcrypt');
const argon2 = require('argon2');

/**
 * Hash password using both bcrypt and argon2 for maximum security
 * @param {string} password - Plain text password
 * @returns {Promise<{bcrypt: string, argon2: string}>}
 */
const hashPassword = async (password) => {
  try {
    // Hash with bcrypt (salt rounds: 10)
    const bcryptHash = await bcrypt.hash(password, 10);
    
    // Hash with argon2 (recommended settings)
    const argon2Hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,       // 3 iterations
      parallelism: 4     // 4 threads
    });
    
    return {
      bcrypt: bcryptHash,
      argon2: argon2Hash
    };
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify password against both bcrypt and argon2 hashes
 * @param {string} password - Plain text password
 * @param {string} bcryptHash - Bcrypt hash
 * @param {string} argon2Hash - Argon2 hash
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (password, bcryptHash, argon2Hash) => {
  try {
    // Verify with both hashes (both must match)
    const [bcryptValid, argon2Valid] = await Promise.all([
      bcrypt.compare(password, bcryptHash),
      argon2.verify(argon2Hash, password)
    ]);
    
    return bcryptValid && argon2Valid;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

module.exports = {
  hashPassword,
  verifyPassword
};

