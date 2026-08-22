import React, { useState } from "react";
import {
  Compass,
  Route,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface AuthViewProps {
  initialMode?: "login" | "register";
  onCloseOrGuest: () => void;
  onAuthSuccess?: (user: {
    name: string;
    email: string;
    role: "tourist" | "operator";
  }) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = "login",
  onCloseOrGuest,
  onAuthSuccess,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"tourist" | "operator">("tourist");

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  // Error States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formGeneralError, setFormGeneralError] = useState("");

  // Success state simulation
  const [successMsg, setSuccessMsg] = useState("");

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      return "An email address is required. Please enter your email.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      return "That email format is invalid. Ensure it includes an @ symbol and a domain name (e.g. name@example.com).";
    }
    return "";
  };

  const validatePassword = (val: string) => {
    if (!val) {
      return "Password cannot be blank. Enter your account password.";
    }
    if (val.length < 6) {
      return "Password must be at least 6 characters long. Add more characters to proceed.";
    }
    return "";
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormGeneralError("");

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) {
      return;
    }

    if (email === "demo@heritage.in" && password !== "gujarat123") {
      setPasswordError("That password doesn't match our records. Try again.");
      return;
    }

    setSuccessMsg(
      "Signed in successfully. Redirecting to your heritage ledger...",
    );
    setTimeout(() => {
      if (onAuthSuccess) {
        onAuthSuccess({
          name: email.split("@")[0] || "Heritage Traveler",
          email,
          role,
        });
      } else {
        onCloseOrGuest();
      }
    }, 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormGeneralError("");

    let valid = true;

    if (!name.trim()) {
      setNameError("Please enter your full name or preferred traveler title.");
      valid = false;
    } else {
      setNameError("");
    }

    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) valid = false;

    const pErr = validatePassword(password);
    setPasswordError(pErr);
    if (pErr) valid = false;

    if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Passwords do not match. Re-enter the confirmation password identically.",
      );
      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (!valid) return;

    setSuccessMsg(
      `Welcome to Heritage Tourism Planner, ${name}! Your ${role} account is now active.`,
    );
    setTimeout(() => {
      if (onAuthSuccess) {
        onAuthSuccess({
          name,
          email,
          role,
        });
      } else {
        onCloseOrGuest();
      }
    }, 1200);
  };

  return (
    <div
      id="account"
      className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-salt my-6"
    >
      <div className="w-full max-w-5xl bg-salt border-2 border-stone/40 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
        {/* LEFT COLUMN: Ink Indigo Banner */}
        <div className="md:col-span-5 bg-ink text-salt p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[260px] md:min-h-[580px]">
          <div
            className="absolute inset-0 bg-stepwell-pattern opacity-25 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-4">
            <button
              onClick={onCloseOrGuest}
              className="inline-flex items-center gap-2 text-xs font-mono text-stone hover:text-gold transition-colors py-1 px-2 border border-stone/30 bg-ink/80 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-gold" />
              <span>Back to Destinations</span>
            </button>

            <div className="flex items-center gap-2.5 pt-4">
              <div className="w-7 h-7 border border-gold flex items-center justify-center p-0.5 bg-ink">
                <div className="w-full h-full bg-gold/90"></div>
              </div>
              <span className="font-display text-lg text-salt tracking-tight">
                Heritage Tourism Planner
              </span>
            </div>
          </div>

          <div className="relative z-10 my-8 space-y-3">
            <span className="font-mono text-xs text-gold uppercase tracking-widest block">
              {mode === "login"
                ? "Gujarat Route Ledger Access"
                : "Join The Heritage Network"}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-salt leading-tight">
              {mode === "login"
                ? "Your Gujarat itinerary, ready in minutes."
                : "Plan terrace routes or present heritage stays."}
            </h2>
            <p className="text-xs font-body text-stone leading-relaxed max-w-xs">
              Access verified ticket prices, distance ledgers, and direct
              contact details for master craftspeople across Kutch, Modhera, and
              Saurashtra.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-stone/30 flex items-center justify-between text-[11px] font-mono text-stone">
            <span>Stepwell System v2.4</span>
            <span className="text-gold">Encrypted & Private</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Salt White Form */}
        <div className="md:col-span-7 bg-salt text-charcoal p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone/30 pb-4 mb-8">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setEmailError("");
                    setPasswordError("");
                    setFormGeneralError("");
                  }}
                  className={`font-display text-xl sm:text-2xl transition-colors cursor-pointer ${
                    mode === "login"
                      ? "text-ink font-semibold border-b-2 border-gold pb-1 -mb-[18px]"
                      : "text-stone hover:text-charcoal"
                  }`}
                >
                  {t("nav.login", "Log In")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setEmailError("");
                    setPasswordError("");
                    setFormGeneralError("");
                  }}
                  className={`font-display text-xl sm:text-2xl transition-colors cursor-pointer ${
                    mode === "register"
                      ? "text-ink font-semibold border-b-2 border-gold pb-1 -mb-[18px]"
                      : "text-stone hover:text-charcoal"
                  }`}
                >
                  {t("auth.register", "Register")}
                </button>
              </div>

              <button
                type="button"
                onClick={onCloseOrGuest}
                className="text-xs font-mono text-stone hover:text-ink underline transition-colors cursor-pointer"
              >
                Continue as guest
              </button>
            </div>

            {successMsg && (
              <div className="mb-6 p-4 bg-ink text-salt border-2 border-gold font-mono text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {formGeneralError && (
              <div className="mb-6 p-4 bg-madder/10 border-l-4 border-madder text-madder font-mono text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formGeneralError}</span>
              </div>
            )}

            {mode === "login" ? (
              <form
                onSubmit={handleLoginSubmit}
                className="space-y-6"
                noValidate
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-mono text-charcoal font-medium uppercase tracking-wider"
                  >
                    {t("auth.email", "Email Address")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="e.g. traveler@heritage.in"
                      className={`w-full pl-10 pr-3 py-3 text-sm bg-salt border font-body transition-colors focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold ${
                        emailError
                          ? "border-madder bg-madder/5"
                          : "border-stone/50 hover:border-stone"
                      }`}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs font-mono text-madder flex items-start gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-mono text-charcoal font-medium uppercase tracking-wider"
                    >
                      {t("auth.password", "Password")}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        alert("Password reset link sent to registered email.")
                      }
                      className="text-xs font-mono text-stone hover:text-gold transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-3 text-sm bg-salt border font-body transition-colors focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold ${
                        passwordError
                          ? "border-madder bg-madder/5"
                          : "border-stone/50 hover:border-stone"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone hover:text-charcoal cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs font-mono text-madder flex items-start gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{passwordError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-madder hover:bg-madder/90 text-salt py-3.5 px-6 font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm border border-madder cursor-pointer"
                >
                  {t("nav.login", "Log In")}
                </button>

                <div className="text-center pt-2 text-xs font-body text-stone">
                  Need a new account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setEmailError("");
                      setPasswordError("");
                    }}
                    className="font-medium text-ink hover:text-gold underline cursor-pointer"
                  >
                    Register here
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleRegisterSubmit}
                className="space-y-5"
                noValidate
              >
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-charcoal font-medium uppercase tracking-wider">
                    Select Account Role:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("tourist")}
                      className={`p-3.5 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        role === "tourist"
                          ? "border-gold bg-ink text-salt shadow-sm"
                          : "border-stone/40 bg-salt text-charcoal hover:border-stone"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Compass
                          className={`w-4 h-4 ${role === "tourist" ? "text-gold" : "text-stone"}`}
                        />
                        <span className="font-display font-semibold text-sm">
                          Tourist
                        </span>
                      </div>
                      <p
                        className={`text-[11px] font-body leading-tight ${role === "tourist" ? "text-salt/80" : "text-stone"}`}
                      >
                        Plan custom terrace routes, save itineraries & access
                        craft guides.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("operator")}
                      className={`p-3.5 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        role === "operator"
                          ? "border-gold bg-ink text-salt shadow-sm"
                          : "border-stone/40 bg-salt text-charcoal hover:border-stone"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Route
                          className={`w-4 h-4 ${role === "operator" ? "text-gold" : "text-stone"}`}
                        />
                        <span className="font-display font-semibold text-sm">
                          Tour operator
                        </span>
                      </div>
                      <p
                        className={`text-[11px] font-body leading-tight ${role === "operator" ? "text-salt/80" : "text-stone"}`}
                      >
                        List heritage stays, guided stepwell tours & manage
                        bookings.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="reg-name"
                    className="block text-xs font-mono text-charcoal font-medium uppercase tracking-wider"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      placeholder="e.g. Vikramaditya Solanki"
                      className={`w-full pl-10 pr-3 py-2.5 text-sm bg-salt border font-body transition-colors focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold ${
                        nameError
                          ? "border-madder bg-madder/5"
                          : "border-stone/50 hover:border-stone"
                      }`}
                      required
                    />
                  </div>
                  {nameError && (
                    <p className="text-xs font-mono text-madder flex items-start gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="reg-email"
                    className="block text-xs font-mono text-charcoal font-medium uppercase tracking-wider"
                  >
                    {t("auth.email", "Email Address")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="name@domain.com"
                      className={`w-full pl-10 pr-3 py-2.5 text-sm bg-salt border font-body transition-colors focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold ${
                        emailError
                          ? "border-madder bg-madder/5"
                          : "border-stone/50 hover:border-stone"
                      }`}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs font-mono text-madder flex items-start gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-mono text-charcoal font-medium uppercase tracking-wider"
                    >
                      {t("auth.password", "Password")}
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="At least 6 chars"
                      className={`w-full px-3 py-2.5 text-sm bg-salt border font-body transition-colors focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold ${
                        passwordError
                          ? "border-madder bg-madder/5"
                          : "border-stone/50 hover:border-stone"
                      }`}
                      required
                    />
                    {passwordError && (
                      <p className="text-[11px] font-mono text-madder pt-0.5">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="reg-confirm"
                      className="block text-xs font-mono text-charcoal font-medium uppercase tracking-wider"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="reg-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError("");
                      }}
                      placeholder="Repeat password"
                      className={`w-full px-3 py-2.5 text-sm bg-salt border font-body transition-colors focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold ${
                        confirmPasswordError
                          ? "border-madder bg-madder/5"
                          : "border-stone/50 hover:border-stone"
                      }`}
                      required
                    />
                    {confirmPasswordError && (
                      <p className="text-[11px] font-mono text-madder pt-0.5">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-madder hover:bg-madder/90 text-salt py-3.5 px-6 font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm border border-madder cursor-pointer"
                >
                  {t("auth.register", "Register")}
                </button>

                <div className="text-center pt-1 text-xs font-body text-stone">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setEmailError("");
                      setPasswordError("");
                    }}
                    className="font-medium text-ink hover:text-gold underline cursor-pointer"
                  >
                    Log in here
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-stone/30 text-center">
            <button
              type="button"
              onClick={onCloseOrGuest}
              className="text-xs font-mono text-stone hover:text-charcoal transition-colors cursor-pointer"
            >
              Continue as guest →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
