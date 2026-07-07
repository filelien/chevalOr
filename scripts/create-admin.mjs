#!/usr/bin/env node
/**
 * Crée un compte admin et attribue super_admin.
 * Usage: node scripts/create-admin.mjs [email] [password]
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
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;
const ANON_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@chevaldor.com";
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!ANON_KEY) {
  console.error("❌ Clé Supabase manquante dans .env.local");
  process.exit(1);
}
if (!password) {
  console.error("❌ Mot de passe requis : node scripts/create-admin.mjs email motdepasse");
  process.exit(1);
}
if (!ACCESS_TOKEN) {
  console.error("❌ SUPABASE_ACCESS_TOKEN manquant dans .env.local");
  process.exit(1);
}

async function runSql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`SQL (${res.status}): ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

async function signUp() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.msg || data.error_description || data.message || JSON.stringify(data);
    if (/already|registered|exists/i.test(msg)) return { exists: true };
    throw new Error(`Signup (${res.status}): ${msg}`);
  }
  return { user: data.user, session: data.session };
}

async function main() {
  console.log(`👤 Création admin : ${email}`);

  const signup = await signUp();
  if (signup.exists) {
    console.log("   Compte déjà existant, attribution du rôle…");
  } else if (signup.user) {
    console.log(`   ✓ Compte créé (id: ${signup.user.id})`);
  }

  const safeEmail = email.replace(/'/g, "''");
  await runSql(`
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email = '${safeEmail}';
  `);
  console.log("   ✓ Email confirmé");

  await runSql(`
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'super_admin'::public.app_role
    FROM auth.users
    WHERE email = '${safeEmail}'
    ON CONFLICT (user_id, role) DO NOTHING;
  `);
  console.log("   ✓ Rôle super_admin attribué");

  const users = await runSql(`SELECT id, email FROM auth.users WHERE email = '${safeEmail}';`);
  console.log("\n✅ Admin prêt :", users?.[0] ?? email);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
