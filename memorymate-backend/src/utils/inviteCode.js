// src/utils/inviteCode.js
// Generate and validate simple invite codes for patient–caregiver linking

const crypto = require('crypto');

// Generate a 6-character uppercase invite code
function generateInviteCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g. "A3F7C2"
}

module.exports = { generateInviteCode };
