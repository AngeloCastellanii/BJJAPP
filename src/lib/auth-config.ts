import { getCloudflareContext } from "@opennextjs/cloudflare";

function readBinding(name: "BJJAPP_AUTH_EMAIL" | "BJJAPP_AUTH_PASSWORD") {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  try {
    const { env } = getCloudflareContext();
    const value = (env as Record<string, unknown>)[name];
    return typeof value === "string" ? value : "";
  } catch {
    return "";
  }
}

/** Credenciales solo desde env / secrets de Cloudflare. */
export function getAuthCredentials() {
  const email = readBinding("BJJAPP_AUTH_EMAIL").trim().toLowerCase();
  const password = readBinding("BJJAPP_AUTH_PASSWORD").trim();
  return { email, password, configured: Boolean(email && password) };
}
