import { getSession, deleteSession } from "../lib/firestore.js";

export default async function handler(req, res) {
  const code = String(req.query.code || "");
  const entry = await getSession(code);
  if (!entry) return res.status(410).send("Code expired");
  if (entry.status !== "approved") return res.status(204).end();

  await deleteSession(code); // one-time read
  res.json(entry.result);
}
