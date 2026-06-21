#!/usr/bin/env node
/**
 * Déploie les migrations Supabase + attribue super_admin à admin@inovafrik.com
 *
 * Prérequis (dans .env ou variables d'environnement) :
 *   SUPABASE_ACCESS_TOKEN  — token depuis https://supabase.com/dashboard/account/tokens
 *   SUPABASE_PROJECT_ID    — yizpcyfcfhojinmfpbhc (déjà dans .env)
 *
 * Usage : node scripts/setup-supabase.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID || process.env.VITE_SUPABASE_PROJECT_ID || "yizpcyfcfhojinmfpbhc";
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@inovafrik.com";

if (!ACCESS_TOKEN) {
  console.error("❌ SUPABASE_ACCESS_TOKEN manquant.");
  console.error("   1. Allez sur https://supabase.com/dashboard/account/tokens");
  console.error("   2. Créez un token et exécutez :");
  console.error('      $env:SUPABASE_ACCESS_TOKEN="sbp_..."; node scripts/setup-supabase.mjs');
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
  if (!res.ok) {
    throw new Error(`SQL error (${res.status}): ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : null;
}

async function main() {
  const migrationsDir = join(ROOT, "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`📦 Projet Supabase : ${PROJECT_ID}`);
  console.log(`📄 ${files.length} migrations à appliquer…\n`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    process.stdout.write(`  → ${file} … `);
    try {
      await runSql(sql);
      console.log("✓");
    } catch (e) {
      console.log("✗");
      console.error(`     ${e.message}`);
      // Continue — certaines migrations peuvent déjà être appliquées
    }
  }

  console.log("\n👤 Attribution super_admin…");
  const roleSql = `
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'super_admin'::public.app_role
    FROM auth.users
    WHERE email = '${ADMIN_EMAIL.replace(/'/g, "''")}'
    ON CONFLICT (user_id, role) DO NOTHING;
  `;
  try {
    await runSql(roleSql);
    console.log(`✓ Rôle super_admin attribué à ${ADMIN_EMAIL} (si le compte existe).`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    console.error("   Créez d'abord le compte admin via /auth puis relancez ce script.");
  }

  console.log("\n✅ Terminé.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
