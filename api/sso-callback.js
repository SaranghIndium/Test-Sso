import { workos, WORKOS_CLIENT_ID } from "../lib/workos.js";
import { getSession, saveSession } from "../lib/firestore.js";

export default async function handler(req, res) {
  try {
    const code  = String(req.query.code || "");
    const state = String(req.query.state || "");
    if (!code || !state) return res.status(400).send("Missing code or state");

    const entry = await getSession(state);
    if (!entry) return res.status(410).send("Unknown pairing code");

    const result = await workos.userManagement.authenticateWithCode({
      clientId: WORKOS_CLIENT_ID,
      code,
    });

    const cleaned = {
      user: result.user,
      ...(result.accessToken  ? { access_token:  result.accessToken }  : {}),
      ...(result.refreshToken ? { refresh_token: result.refreshToken } : {}),
      ...(result.idToken      ? { id_token:      result.idToken }      : {}),
    };

    await saveSession(state, {
      status: "approved",
      result: cleaned,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<html><body style="font-family:sans-serif">
      <h2>Login complete</h2>
      <p>You can return to the game now.</p>
    </body></html>`);
  } catch (e) {
    console.error("sso-callback error:", e);
    res.status(500).send(e?.message || String(e));
  }
}
