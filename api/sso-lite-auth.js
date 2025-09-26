import {
  workos,
  WORKOS_CLIENT_ID,
  WORKOS_CONNECTION_ID,
  WORKOS_ORG_ID,
  BASE_URL,
} from "../lib/workos.js";

export default async function handler(req, res) {
  try {
    const pairingCode = String(req.query.code || "");
    if (!pairingCode) return res.status(400).send("Missing query param: code");

    if (!WORKOS_CLIENT_ID) return res.status(500).send("WORKOS_CLIENT_ID not set");
    if (!BASE_URL)          return res.status(500).send("BASE_URL not set");

    const params = {
      clientId:   WORKOS_CLIENT_ID,
      redirectUri: `${BASE_URL}/api/sso-callback`,
      state:       pairingCode,    
    };

    if (WORKOS_CONNECTION_ID) {
      params.connectionId = WORKOS_CONNECTION_ID;    
    } else if (WORKOS_ORG_ID) {
      params.organizationId = WORKOS_ORG_ID;        
    } else if (process.env.WORKOS_PROVIDER) {
      params.provider = process.env.WORKOS_PROVIDER;  
    } else {
      return res
        .status(500)
        .send("Configure one of: WORKOS_CONNECTION_ID, WORKOS_ORG_ID, or WORKOS_PROVIDER");
    }

    let authUrl = await workos.userManagement.getAuthorizationUrl(params);
    if (authUrl && typeof authUrl === "object" && authUrl.authorizationUrl) {
      authUrl = authUrl.authorizationUrl;
    }
    if (!authUrl) throw new Error("getAuthorizationUrl returned no URL");

    res.setHeader("Location", authUrl);
    res.statusCode = 302;
    res.end();
  } catch (err) {
    const msg = err?.response?.data
      ? JSON.stringify(err.response.data)
      : (err?.message || String(err));
    console.error("sso-lite-auth error:", msg);
    res.status(500).send(`Auth URL error: ${msg}`);
  }
}
