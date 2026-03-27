import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !submitting,
    [email, password, submitting],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-zinc-300">
                Sign in to track scores and manage your subscription.
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-medium text-zinc-300">Email</span>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-white/20">
                <Mail className="h-4 w-4 text-zinc-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-medium text-zinc-300">
                Password
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-white/20">
                <KeyRound className="h-4 w-4 text-zinc-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-100 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              {submitting ? "Signing in…" : "Login"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-sm text-zinc-300">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-white">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

