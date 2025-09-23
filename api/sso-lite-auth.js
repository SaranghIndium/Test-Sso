import { getSession } from "../lib/firestore.js";
import { workos, WORKOS_CLIENT_ID, WORKOS_ORG_ID, WORKOS_CONNECTION_ID, BASE_URL } from "../lib/workos.js";

export default async function handler(req, res) {
  const code = String(req.query.code || "");
  const entry = await getSession(code);
  if (!entry) return res.status(410).send("Invalid or expired code");

  const redirectUri = `${BASE_URL}/api/sso-callback`;

  const params = {
    clientId: WORKOS_CLIENT_ID,
    redirectUri,
    state: code, // carry the pairing code via 'state'
  };
  if (WORKOS_ORG_ID) params.organization = WORKOS_ORG_ID;
  if (WORKOS_CONNECTION_ID) params.connection = WORKOS_CONNECTION_ID;

  const { url } = await workos.userManagement.getAuthorizationUrl(params);
  res.writeHead(302, { Location: url });
  res.end();
}
