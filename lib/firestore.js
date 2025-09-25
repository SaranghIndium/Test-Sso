import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:  process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey:  process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = admin.firestore();

export async function saveSession(code, data) {
  await db.collection("sso_sessions").doc(code).set(data, { merge: true });
}

export async function getSession(code) {
  const snap = await db.collection("sso_sessions").doc(code).get();
  return snap.exists ? snap.data() : null;
}

export async function deleteSession(code) {
  await db.collection("sso_sessions").doc(code).delete();
}

// Optional: quick health probe
export async function pingFirestore() {
  try {
    await db.collection("_ping").doc("now").set({ ts: Date.now() }, { merge: true });
    return true;
  } catch (e) {
    console.error("[firestore ping] failed:", e);
    return false;
  }
}
