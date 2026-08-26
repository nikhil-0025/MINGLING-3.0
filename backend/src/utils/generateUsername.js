/**
 * Temporary Username Generator
 * (generateUsername.js)
 */

function generateUsername() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `Mingling User #${num}`;
}

module.exports = generateUsername;
