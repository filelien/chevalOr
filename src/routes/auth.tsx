import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { HotelLogo } from "@/components/brand/HotelLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion — Hôtel Le Cheval d'Or" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const u = t.ui.auth;
  const router = useRouter();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName, phone },
        },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success(u.accountCreated);
      router.invalidate();
      navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success(u.welcome);
      router.invalidate();
      navigate({ to: "/" });
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto flex max-w-md flex-col items-center px-6 py-20">
        <HotelLogo size="lg" tone="light" wrap />
        <h1 className="mt-6 font-display text-3xl">{mode === "login" ? u.login : u.signup}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{u.title}</p>

        <form onSubmit={handleSubmit} className="mt-10 w-full space-y-4 rounded-xl border border-border bg-card p-8 shadow-elegant">
          {mode === "signup" && (
            <>
              <Field label={u.fullName} type="text" value={fullName} onChange={setFullName} required />
              <Field label={u.phone} type="tel" value={phone} onChange={setPhone} />
            </>
          )}
          <Field label={u.email} type="email" value={email} onChange={setEmail} required />
          <Field label={u.password} type="password" value={password} onChange={setPassword} required minLength={6} />

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? t.common.loading : mode === "login" ? u.signIn : u.register}
          </Button>
          <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="block w-full text-center text-sm text-muted-foreground hover:text-gold-deep">
            {mode === "login" ? `${u.noAccount} ${u.register}` : `${u.haveAccount} ${u.signIn}`}
          </button>
        </form>
      </section>
    </SiteShell>
  );
}

function Field(props: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean; minLength?: number }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-muted-foreground">
      {props.label}
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        required={props.required}
        minLength={props.minLength}
        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}