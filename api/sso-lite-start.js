// /api/sso-lite-start.js
import { nanoid } from "nanoid";
import { saveSession } from "../lib/firestore.js";
import { BASE_URL } from "../lib/workos.js";

/**
 * Creates a short pairing code, stores it, and returns:
 * { code: "ABCD-12", verification_url: "https://<domain>/api/sso-lite-auth?code=ABCD-12" }
 */
export default async function handler(req, res) {
  // Basic CORS (Unity Editor sometimes issues preflights via extensions)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") return res.status(405).end();

  // CORS for the actual POST
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    if (!BASE_URL)
      return res.status(500).json({ error: "BASE_URL not set" });

    // generate code: 4 + 2 alphanumerics, uppercased
    const id = nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, "X");
    const code = `${id.slice(0, 4)}-${id.slice(4)}`;

    // persist session (must not throw)
    await saveSession(code, { status: "pending", createdAt: Date.now() });

    const verification_url = `${BASE_URL}/api/sso-lite-auth?code=${encodeURIComponent(code)}`;
    return res.status(200).json({ code, verification_url });
  } catch (err) {
    console.error("[sso-lite-start] ERROR:", err); // check in Vercel → Function Logs
    return res.status(500).json({ error: "sso-lite-start failed", detail: String(err) });
  }
}
