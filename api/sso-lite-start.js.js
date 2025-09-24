import { nanoid } from "nanoid";
import { saveSession } from "../lib/firestore.js";
import { BASE_URL } from "../lib/workos.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!BASE_URL) return res.status(500).send("BASE_URL not set");

  const id = nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, "X");
  const code = `${id.slice(0,4)}-${id.slice(4)}`;

  await saveSession(code, { status: "pending", createdAt: Date.now() });

  const verification_url = `${BASE_URL}/api/sso-lite-auth?code=${encodeURIComponent(code)}`;
  res.json({ code, verification_url });
}
