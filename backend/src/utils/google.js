const { OAuth2Client } = require('google-auth-library');

let client;
function getClient() {
  if (!client) {
    const cid = process.env.GOOGLE_CLIENT_ID;
    client = new OAuth2Client(cid);
  }
  return client;
}

async function verifyGoogleIdToken(idToken) {
  const cid = process.env.GOOGLE_CLIENT_ID;
  if (!cid) throw new Error('Missing GOOGLE_CLIENT_ID');
  const ticket = await getClient().verifyIdToken({ idToken, audience: cid });
  const payload = ticket.getPayload();
  return payload;
}

module.exports = { verifyGoogleIdToken };