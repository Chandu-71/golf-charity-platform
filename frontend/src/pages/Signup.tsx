import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgePercent,
  CreditCard,
  HeartHandshake,
  KeyRound,
  Mail,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Plan = "Monthly" | "Yearly";

export function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<Plan>("Monthly");
  const [charityId, setCharityId] = useState<string>("");
  const [charityPercentage, setCharityPercentage] = useState<number>(10);

  const [charities, setCharities] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharities = async () => {
      console.log('Attempting to fetch charities from Supabase...');
      const { data, error } = await supabase.from('charities').select('*');
      
      if (error) {
        console.error('Supabase Error Fetching Charities:', error.message);
      } else {
        console.log('Successfully fetched charities:', data);
        setCharities(data || []);
      }
    };
    fetchCharities();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.length > 0 &&
      charityId.length > 0 &&
      charityPercentage >= 10 &&
      !submitting
    );
  }, [email, password, charityId, charityPercentage, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setSubmitting(false);
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setSubmitting(false);
      setError("Signup succeeded but no user id was returned.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role: "user",
      plan,
      charity_id: charityId,
      charity_percentage: charityPercentage,
    });

    setSubmitting(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_80px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-zinc-300">
                Choose a plan and charity at signup. Your subscription becomes
                measurable support.
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 text-white">
              <HeartHandshake className="h-5 w-5" />
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
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

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-xs font-medium text-zinc-300">
                  Password
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-white/20">
                  <KeyRound className="h-4 w-4 text-zinc-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-medium text-zinc-300">Plan</span>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-white/20">
                  <CreditCard className="h-4 w-4 text-zinc-400" />
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as Plan)}
                    className="w-full bg-transparent text-sm text-white outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-medium text-zinc-300">
                  Charity Percentage
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-white/20">
                  <BadgePercent className="h-4 w-4 text-zinc-400" />
                  <input
                    value={charityPercentage}
                    onChange={(e) => setCharityPercentage(Number(e.target.value))}
                    type="number"
                    min={10}
                    className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                    required
                  />
                </div>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-xs font-medium text-zinc-300">Charity</span>
              <select
                value={charityId}
                onChange={(e) => setCharityId(e.target.value)}
                className="w-full h-12 px-4 py-2 rounded-md border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              >
                <option
                  value=""
                  disabled
                  className="bg-gray-900 text-white py-2"
                >
                  Select a Charity
                </option>
                {charities.map(charity => <option key={charity.id} value={charity.id}>{charity.name}</option>)}
              </select>
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
              {submitting ? "Creating account…" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-sm text-zinc-300">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-white">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

