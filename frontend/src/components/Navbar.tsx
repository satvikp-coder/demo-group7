import React, { useState } from "react";
import {
  Compass,
  Calendar,
  Building2,
  DollarSign,
  UserCheck,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  onOpenPlanner: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAuth?: (mode: "login" | "register") => void;
  user?: { name: string; email: string; role: "tourist" | "operator" } | null;
  onLogout?: () => void;
  tripCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPlanner,
  onNavigateSection,
  onOpenAuth,
  user,
  onLogout,
  tripCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (sectionId === "account" && onOpenAuth) {
      onOpenAuth("login");
      return;
    }
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { theme, toggleTheme } = useTheme();

  const ThemeToggle = () => (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dusk"
          ? "Switch to Stepwell Light Theme"
          : "Switch to Dusk Evening Theme"
      }
      title={
        theme === "dusk"
          ? "Switch to Light Theme"
          : "Switch to Dusk (Rann of Kutch Evening) Theme"
      }
      className="p-1.5 bg-ink border border-stone/40 text-gold hover:text-salt hover:bg-stone/20 transition-all cursor-pointer inline-flex items-center justify-center shadow-sm"
    >
      {theme === "dusk" ? (
        <Sun className="w-4 h-4 text-gold" />
      ) : (
        <Moon className="w-4 h-4 text-gold" />
      )}
    </button>
  );

  const LanguageToggle = () => (
    <div
      className="inline-flex items-center bg-ink border border-stone/40 p-0.5 rounded-none shadow-sm"
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="Switch to English"
        aria-pressed={language === "en"}
        className={`px-2 py-1 text-xs font-mono transition-all duration-150 cursor-pointer ${
          language === "en"
            ? "bg-gold text-ink font-bold border border-gold shadow-sm"
            : "text-salt/80 hover:text-salt hover:bg-stone/20"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("gu")}
        aria-label="Switch to Gujarati"
        aria-pressed={language === "gu"}
        className={`px-2 py-1 text-xs font-mono transition-all duration-150 cursor-pointer ${
          language === "gu"
            ? "bg-gold text-ink font-bold border border-gold shadow-sm"
            : "text-salt/80 hover:text-salt hover:bg-stone/20"
        }`}
      >
        ગુજ
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        aria-label="Switch to Hindi"
        aria-pressed={language === "hi"}
        className={`px-2 py-1 text-xs font-mono transition-all duration-150 cursor-pointer ${
          language === "hi"
            ? "bg-gold text-ink font-bold border border-gold shadow-sm"
            : "text-salt/80 hover:text-salt hover:bg-stone/20"
        }`}
      >
        हिं
      </button>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-ink border-b border-stone/30 text-salt shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Wordmark */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavClick("hero")}
          >
            {/* Stepped Icon Graphic */}
            <div className="w-9 h-9 border border-gold/60 flex items-center justify-center p-1 bg-ink/80">
              <div className="w-full h-full border border-salt/20 flex items-end justify-start p-0.5">
                <div className="w-2/3 h-2/3 bg-gold/80 flex items-end justify-start">
                  <div className="w-1/2 h-1/2 bg-madder"></div>
                </div>
              </div>
            </div>
            <div>
              <span className="font-display text-xl sm:text-2xl tracking-tight text-salt block leading-none">
                {t("nav.brand", "Gujarat Heritage Directory")}
              </span>
              <span className="font-mono text-[10px] text-stone tracking-wider uppercase mt-1 block">
                {t("nav.subtitle", "Stepwell Geometric Itinerary Engine")}
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => handleNavClick("explore")}
              className="text-salt/90 hover:text-gold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-gold/80" />
              <span>{t("nav.explore", "Explore")}</span>
            </button>

            <button
              onClick={onOpenPlanner}
              className="text-salt/90 hover:text-gold transition-colors duration-150 flex items-center gap-1.5 relative cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-gold/80" />
              <span>{t("nav.planItinerary", "Plan Itinerary")}</span>
              {tripCount > 0 && (
                <span className="bg-gold text-ink font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-ink">
                  {tripCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick("hotels")}
              className="text-salt/90 hover:text-gold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-gold/80" />
              <span>{t("nav.hotels", "Ranked Stays")}</span>
            </button>

            <button
              onClick={() => handleNavClick("budget")}
              className="text-salt/90 hover:text-gold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-gold/80" />
              <span>{t("nav.budget", "Budget Planner")}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick("profile")}
                  className="text-xs font-mono text-gold hover:text-salt flex items-center gap-1.5 bg-salt/10 hover:bg-salt/20 px-2.5 py-1.5 border border-gold/40 cursor-pointer transition-colors"
                  title="View Profile & Saved Trips Dashboard"
                >
                  <UserCheck className="w-3.5 h-3.5 text-gold" />
                  <span>
                    {user.name} ({user.role})
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs font-mono text-stone hover:text-salt underline cursor-pointer"
                >
                  {t("profile.signOut", "Sign Out")}
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  onOpenAuth ? onOpenAuth("login") : handleNavClick("account")
                }
                className="border border-stone/40 hover:border-gold px-3 py-1.5 text-xs text-salt/90 hover:text-salt transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-stone" />
                <span>{t("nav.signIn", "Sign In")}</span>
              </button>
            )}

            {/* Language & Theme Toggle Controls */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>

            <button
              onClick={onOpenPlanner}
              className="bg-madder hover:bg-madder/90 text-salt px-3.5 py-2 text-xs uppercase tracking-wider font-semibold transition-colors duration-150 border border-madder flex items-center gap-2 cursor-pointer"
            >
              <span>{t("nav.planItinerary", "Plan Itinerary")}</span>
              {tripCount > 0 && (
                <span className="bg-salt text-madder font-mono text-[10px] font-bold px-1.5 py-0.2">
                  {tripCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button & Compact Language/Theme Toggles */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-salt hover:text-gold p-2 border border-stone/30"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ink border-t border-stone/30 px-4 pt-4 pb-6 space-y-3">
          <button
            onClick={() => handleNavClick("explore")}
            className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
          >
            <span>{t("nav.explore", "Explore")}</span>
            <Compass className="w-4 h-4 text-gold" />
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPlanner();
            }}
            className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
          >
            <span>{t("nav.planItinerary", "Plan Itinerary")}</span>
            <Calendar className="w-4 h-4 text-gold" />
          </button>
          <button
            onClick={() => handleNavClick("hotels")}
            className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
          >
            <span>{t("nav.hotels", "Ranked Stays")}</span>
            <Building2 className="w-4 h-4 text-gold" />
          </button>
          <button
            onClick={() => handleNavClick("budget")}
            className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
          >
            <span>{t("nav.budget", "Budget Planner")}</span>
            <DollarSign className="w-4 h-4 text-gold" />
          </button>
          {user ? (
            <button
              onClick={() => handleNavClick("profile")}
              className="w-full text-left py-2 text-gold hover:text-salt text-sm font-medium border-b border-stone/20 flex items-center justify-between"
            >
              <span>{t("nav.profile", "Profile & History")}</span>
              <UserCheck className="w-4 h-4 text-gold" />
            </button>
          ) : (
            <button
              onClick={() => handleNavClick("account")}
              className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
            >
              <span>{t("nav.signIn", "Sign In")}</span>
              <UserCheck className="w-4 h-4 text-gold" />
            </button>
          )}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPlanner();
              }}
              className="w-full bg-madder hover:bg-madder/90 text-salt py-3 text-center text-sm font-semibold uppercase tracking-wider"
            >
              {t("nav.planItinerary", "Plan Itinerary")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
