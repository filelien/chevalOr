const html = await (await fetch("https://cheval-or.vercel.app/")).text();
const scripts = [...html.matchAll(/src="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((s) => s.includes("/assets/"));

for (const src of scripts) {
  const url = src.startsWith("http") ? src : `https://cheval-or.vercel.app${src}`;
  const js = await (await fetch(url)).text();
  if (!js.includes("supabase") && !js.includes("yizpcyfcfhojinmfpbhc") && !js.includes("hnmkszmpmsksgtqoatyr")) continue;
  console.log("---", src);
  console.log("supabase.co:", [...new Set(js.match(/https:\/\/[a-z0-9]+\.supabase\.co/g) || [])]);
  console.log("publishable:", [...new Set(js.match(/sb_publishable_[A-Za-z0-9_-]+/g) || [])]);
  console.log("old project:", js.includes("yizpcyfcfhojinmfpbhc"));
  console.log("new project:", js.includes("hnmkszmpmsksgtqoatyr"));
}
