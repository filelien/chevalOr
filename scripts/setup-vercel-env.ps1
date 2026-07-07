# Configure les variables Supabase sur Vercel (nécessite: npx vercel login)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$vars = @{
  "VITE_SUPABASE_URL" = "https://hnmkszmpmsksgtqoatyr.supabase.co"
  "VITE_SUPABASE_PUBLISHABLE_KEY" = "sb_publishable_cGobpbFN7isHy5N61Rq4Rw_rZHBXN5E"
  "SUPABASE_URL" = "https://hnmkszmpmsksgtqoatyr.supabase.co"
  "SUPABASE_PUBLISHABLE_KEY" = "sb_publishable_cGobpbFN7isHy5N61Rq4Rw_rZHBXN5E"
}

Write-Host "Liaison du projet Vercel (si pas encore fait)..."
npx vercel link --yes 2>&1

foreach ($name in $vars.Keys) {
  $value = $vars[$name]
  Write-Host "Ajout de $name ..."
  $value | npx vercel env add $name production preview development --force 2>&1
}

Write-Host ""
Write-Host "Redéploiement en production..."
npx vercel --prod --yes 2>&1

Write-Host ""
Write-Host "Terminé. Testez : https://cheval-or.vercel.app/auth"
