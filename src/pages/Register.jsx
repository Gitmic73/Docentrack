import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, ClipboardList } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import RegisterWelcome from "@/components/registro/RegisterWelcome";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registrazione non riuscita");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Codice di verifica non valido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Codice inviato",
        description: "Controlla la tua email per il nuovo codice.",
      });
    } catch (err) {
      setError(err.message || "Impossibile reinviare il codice");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  // ===== OTP step =====
  if (showOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blu mb-4">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-blu">Verifica la tua email</h1>
            <p className="text-sm text-grigio mt-2">Abbiamo inviato un codice a {email}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-bordo p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rosso-light text-rosso text-sm">{error}</div>
            )}
            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                autoFocus
                autoComplete="one-time-code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              className="w-full h-12 font-medium bg-blu hover:bg-[#4A6A9E]"
              onClick={handleVerify}
              disabled={loading || otpCode.length < 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifica in corso…
                </>
              ) : (
                "Verifica"
              )}
            </Button>
            <p className="text-center text-sm text-grigio mt-4">
              Non hai ricevuto il codice?{" "}
              <button onClick={handleResend} className="text-blu font-medium hover:underline">
                Reinvia
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== Registration form =====
  return (
    <div className="min-h-screen flex bg-[#F4F6F9]">
      {/* Left: welcome / feature preview (desktop only) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#F4F6F9] to-[#E8EEF6] border-r border-bordo">
        <div className="w-full max-w-lg mx-auto">
          <RegisterWelcome />
        </div>
      </div>

      {/* Right: registration form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blu to-oro flex items-center justify-center shadow-md">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-blu leading-none">DocenTrack</h1>
              <p className="text-[10px] text-grigio mt-0.5">Registro Attività Funzionali</p>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-bordo p-7">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">Crea il tuo account</h2>
              <p className="text-sm text-grigio mt-1">
                Gratis per il primo anno scolastico — nessuna carta di credito richiesta.
              </p>
            </div>

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
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grigio" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-bordo focus:border-blu"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-foreground">Conferma password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grigio" aria-hidden="true" />
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Creazione account…
                  </>
                ) : (
                  "Crea account gratuito"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-grigio mt-5">
            Hai già un account?{" "}
            <Link
              to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
              className="text-blu font-medium hover:underline"
            >
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}