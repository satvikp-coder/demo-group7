import React, { useState } from 'react';
import { Compass, Calendar, Building2, DollarSign, UserCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenPlanner: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  user?: { name: string; email: string; role: 'tourist' | 'operator' } | null;
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

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (sectionId === 'account' && onOpenAuth) {
      onOpenAuth('login');
      return;
    }
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-ink border-b border-stone/30 text-salt shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Wordmark */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('hero')}>
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
                Heritage Tourism Planner
              </span>
              <span className="font-mono text-[10px] text-stone tracking-wider uppercase mt-1 block">
                Gujarat Heritage Directory & Route Ledger
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <button
              onClick={() => handleNavClick('explore')}
              className="text-salt/90 hover:text-gold transition-colors duration-150 flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-gold/80" />
              <span>Explore</span>
            </button>

            <button
              onClick={onOpenPlanner}
              className="text-salt/90 hover:text-gold transition-colors duration-150 flex items-center gap-1.5 relative"
            >
              <Calendar className="w-4 h-4 text-gold/80" />
              <span>Plan a Trip</span>
              {tripCount > 0 && (
                <span className="bg-gold text-ink font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-ink">
                  {tripCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('hotels')}
              className="text-salt/90 hover:text-gold transition-colors duration-150 flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-gold/80" />
              <span>Hotels & Heritage Stays</span>
            </button>

            <button
              onClick={() => handleNavClick('budget')}
              className="text-salt/90 hover:text-gold transition-colors duration-150 flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-gold/80" />
              <span>Budget Planner</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="text-xs font-mono text-gold hover:text-salt flex items-center gap-1.5 bg-salt/10 hover:bg-salt/20 px-2.5 py-1.5 border border-gold/40 cursor-pointer transition-colors"
                  title="View Profile & Saved Trips Dashboard"
                >
                  <UserCheck className="w-3.5 h-3.5 text-gold" />
                  <span>{user.name} ({user.role})</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs font-mono text-stone hover:text-salt underline cursor-pointer"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : handleNavClick('account')}
                className="border border-stone/40 hover:border-gold px-3.5 py-1.5 text-xs text-salt/90 hover:text-salt transition-colors duration-150 flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-stone" />
                <span>Login / Register</span>
              </button>
            )}

            <button
              onClick={onOpenPlanner}
              className="bg-madder hover:bg-madder/90 text-salt px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors duration-150 border border-madder flex items-center gap-2"
            >
              <span>Plan This Trip</span>
              {tripCount > 0 && (
                <span className="bg-salt text-madder font-mono text-[10px] font-bold px-1.5 py-0.2">
                  {tripCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-salt hover:text-gold p-2 border border-stone/30"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ink border-t border-stone/30 px-4 pt-4 pb-6 space-y-3">
          <button
            onClick={() => handleNavClick('explore')}
            className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
          >
            <span>Explore Destinations</span>
            <Compass className="w-4 h-4 text-gold" />
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPlanner();
            }}
            className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
          >
            <span>Plan a Trip</span>
            <Calendar className="w-4 h-4 text-gold" />
          </button>
          <button
            onClick={() => handleNavClick('hotels')}
            className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
          >
            <span>Hotels & Heritage Stays</span>
            <Building2 className="w-4 h-4 text-gold" />
          </button>
          {user ? (
            <button
              onClick={() => handleNavClick('profile')}
              className="w-full text-left py-2 text-gold hover:text-salt text-sm font-medium border-b border-stone/20 flex items-center justify-between"
            >
              <span>My Profile & Saved Trips</span>
              <UserCheck className="w-4 h-4 text-gold" />
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('account')}
              className="w-full text-left py-2 text-salt hover:text-gold text-sm font-medium border-b border-stone/20 flex items-center justify-between"
            >
              <span>Login / Register</span>
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
              Plan This Trip
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
