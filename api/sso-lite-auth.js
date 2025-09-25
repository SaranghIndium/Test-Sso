import {
  workos,
  WORKOS_CLIENT_ID,
  WORKOS_ORG_ID,
  WORKOS_CONNECTION_ID,
  BASE_URL,
} from "../lib/workos.js";

export default async function handler(req, res) {
  try {
    const pairingCode = String(req.query.code || "");
    if (!pairingCode) return res.status(400).send("Missing query param: code");
    if (!WORKOS_CLIENT_ID) return res.status(500).send("WORKOS_CLIENT_ID not set");
    if (!BASE_URL) return res.status(500).send("BASE_URL not set");

    const redirectUri = `${BASE_URL}/api/sso-callback`;

    const params = {
      clientId: WORKOS_CLIENT_ID,
      redirectUri,
      state: pairingCode,
    };

    if (WORKOS_CONNECTION_ID) params.connectionId = WORKOS_CONNECTION_ID;
    else if (WORKOS_ORG_ID)    params.organizationId = WORKOS_ORG_ID;
    else if (process.env.WORKOS_PROVIDER) params.provider = process.env.WORKOS_PROVIDER;
    else {
      return res
        .status(500)
        .send("Configure one of: WORKOS_CONNECTION_ID, WORKOS_ORG_ID, or WORKOS_PROVIDER");
    }

    const url = await workos.userManagement.getAuthorizationUrl(params);
    res.writeHead(302, { Location: url });
    res.end();
  } catch (err) {
    console.error("sso-lite-auth error:", err);
    res.status(500).send(`Auth URL error: ${err?.message || err}`);
  }
}
