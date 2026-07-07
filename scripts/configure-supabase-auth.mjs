#!/usr/bin/env node
/**
 * Configure Supabase Auth pour la production Vercel.
 * Usage: node scripts/configure-supabase-auth.mjs [site-url]
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvLocal() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || "hnmkszmpmsksgtqoatyr";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SITE_URL = (process.argv[2] || "https://cheval-or.vercel.app").replace(/\/$/, "");

if (!ACCESS_TOKEN) {
  console.error("❌ SUPABASE_ACCESS_TOKEN manquant dans .env.local");
  process.exit(1);
}

const REDIRECT_URLS = [
  `${SITE_URL}/**`,
  "https://*.vercel.app/**",
  "http://localhost:5173/**",
  "https://chevaldor.tg/**",
  "https://www.chevaldor.tg/**",
];

async function api(path, options = {}) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${options.method || "GET"} ${path} (${res.status}): ${text.slice(0, 400)}`);
  return data;
}

async function main() {
  console.log(`🔧 Configuration Auth Supabase — ${PROJECT_ID}`);
  console.log(`   Site URL : ${SITE_URL}\n`);

  const current = await api(`/projects/${PROJECT_ID}/config/auth`);
  console.log("   Config actuelle :");
  console.log(`   - site_url: ${current.site_url}`);
  console.log(`   - uri_allow_list: ${current.uri_allow_list || "(vide)"}\n`);

  const existing = (current.uri_allow_list || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const merged = [...new Set([...existing, ...REDIRECT_URLS])];

  const updated = await api(`/projects/${PROJECT_ID}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify({
      site_url: SITE_URL,
      uri_allow_list: merged.join("\n"),
    }),
  });

  // Vérification : l'API doit renvoyer des URLs séparées par des retours ligne
  const list = (updated.uri_allow_list || "").split("\n").filter(Boolean);

  console.log("✅ Auth configuré :");
  console.log(`   - site_url: ${updated.site_url}`);
  console.log(`   - uri_allow_list (${list.length} URLs) :`);
  for (const u of list) console.log(`     • ${u}`);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
