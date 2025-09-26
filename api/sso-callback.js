import { workos, WORKOS_CLIENT_ID } from "../lib/workos.js";
import { getSession, saveSession } from "../lib/firestore.js";

export default async function handler(req, res) {
  try {
    const code  = String(req.query.code || "");
    const state = String(req.query.state || "");

    if (!code)  return res.status(400).send("Missing `code`");
    if (!state) return res.status(400).send("Missing `state` (pairing code)");

    const entry = await getSession(state);
    if (!entry) return res.status(410).send("Unknown pairing code");

    const result = await workos.userManagement.authenticateWithCode({
      clientId: WORKOS_CLIENT_ID,
      code,
    });

    await saveSession(state, {
      status: "approved",
      result: {
        user: result.user,
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        id_token: result.idToken,
      },
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end(`<html><body style="font-family:sans-serif">
      <h2>Login complete</h2>
      <p>You can return to the game now.</p>
    </body></html>`);
  } catch (e) {
    console.error("sso-callback error:", e?.response?.data || e);
    return res
      .status(500)
      .send(e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || String(e)));
  }
}
