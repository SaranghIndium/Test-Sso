import { WorkOS } from "@workos-inc/node";

export const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const WORKOS_CLIENT_ID     = process.env.WORKOS_CLIENT_ID;       // client_...
export const WORKOS_ORG_ID        = process.env.WORKOS_ORG_ID;          // org_...
export const WORKOS_CONNECTION_ID = process.env.WORKOS_CONNECTION_ID;   // conn_... (optional)

export const BASE_URL = (process.env.BASE_URL || "").replace(/\/$/, ""); // <- trim trailing /
