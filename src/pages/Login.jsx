import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ClipboardList, CheckCircle2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Email o password non validi");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blu to-oro flex items-center justify-center shadow-md">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-2xl font-bold text-blu leading-none">DocenTrack</h1>
              <p className="text-[11px] text-grigio mt-0.5">Registro Attività Funzionali all'Insegnamento</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80">
            Accedi al tuo registro delle <strong className="text-blu">40+40 ore</strong> annuali
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-bordo p-7">
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium mb-5 border-bordo hover:bg-blu-light"
            onClick={handleGoogle}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continua con Google
          </Button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bordo" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-grigio">oppure</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rosso-light text-rosso text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grigio" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="nome@istruzione.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-bordo focus:border-blu"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Link to="/forgot-password" className="text-xs text-blu hover:underline">
                  Password dimenticata?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grigio" aria-hidden="true" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-bordo focus:border-blu"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-medium bg-blu hover:bg-[#4A6A9E]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accesso in corso…
                </>
              ) : (
                "Accedi"
              )}
            </Button>
          </form>
        </div>

        {/* Info badges */}
        <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-grigio">
            <CheckCircle2 size={13} className="text-verde" /> Conforme Art. 29 CCNL
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-grigio">
            <CheckCircle2 size={13} className="text-verde" /> Gratis il primo anno
          </span>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-grigio mt-5">
          Non hai un account?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="text-blu font-medium hover:underline"
          >
            Registrati gratis
          </Link>
        </p>
      </div>
    </div>
  );
}