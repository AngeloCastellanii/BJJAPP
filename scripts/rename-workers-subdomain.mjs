import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const accountId = "b7aace26fc0e6c324339b752d09260ec";
const desired = process.argv[2] || "bjjapp-hq";

const tomlPaths = [
  join(process.env.APPDATA || "", "xdg.config", ".wrangler", "config", "default.toml"),
  join(homedir(), ".wrangler", "config", "default.toml"),
];

let token = "";
for (const p of tomlPaths) {
  try {
    const raw = readFileSync(p, "utf8");
    const m = raw.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (m) {
      token = m[1];
      break;
    }
  } catch {
    /* next */
  }
}

if (!token) {
  console.error("No oauth_token. Ejecuta: pnpm exec wrangler login");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function getSubdomain() {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
    { headers, signal: AbortSignal.timeout(25000) },
  );
  const json = await res.json();
  return json.result?.subdomain ?? null;
}

async function main() {
  const current = await getSubdomain();
  console.log("Actual:", current);

  if (current === desired) {
    console.log(`Ya está en ${desired}`);
    console.log(`URL: https://bjjapp.${desired}.workers.dev`);
    return;
  }

  if (current) {
    const delRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
      { method: "DELETE", headers, signal: AbortSignal.timeout(25000) },
    );
    console.log("DELETE status:", delRes.status);
    await new Promise((r) => setTimeout(r, 2000));
  }

  const putRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({ subdomain: desired }),
      signal: AbortSignal.timeout(25000),
    },
  );
  const putJson = await putRes.json();
  if (!putJson.success) {
    console.error("Error:", JSON.stringify(putJson.errors, null, 2));
    process.exit(1);
  }
  console.log("Nuevo subdomain:", putJson.result?.subdomain || desired);
  console.log(`URL: https://bjjapp.${putJson.result?.subdomain || desired}.workers.dev`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
