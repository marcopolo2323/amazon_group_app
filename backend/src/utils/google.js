const { OAuth2Client } = require('google-auth-library');

let client;
function getClient() {
  if (!client) {
    client = new OAuth2Client();
  }
  return client;
}

function getAllowedAudiences() {
  const ids = (process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '').split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_IDS');
  return ids;
}

async function verifyGoogleIdToken(idToken) {
  const audiences = getAllowedAudiences();
  const ticket = await getClient().verifyIdToken({ idToken, audience: audiences });
  const payload = ticket.getPayload();
  return payload;
}

module.exports = { verifyGoogleIdToken };