// navbar with auth state, role-based visibility, and mobile menu

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  Map, BarChart3, FlaskConical, Shield, Menu, X,
  ChevronDown, User, LogOut, Settings, Radio, TrendingUp,
  Crosshair
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Discover', href: '/map', icon: Map, public: true },
  { label: 'Intelligence', href: '/intelligence', icon: BarChart3, minRole: 'org_admin' as const },
  { label: 'Simulator', href: '/simulator', icon: FlaskConical, minRole: 'org_admin' as const },
  { label: 'Forecast', href: '/forecast', icon: TrendingUp, minRole: 'org_admin' as const },
  { label: 'Landscape', href: '/landscape', icon: Crosshair, minRole: 'org_admin' as const },
  { label: 'Pulse', href: '/pulse', icon: Radio, minRole: 'org_admin' as const },
  { label: 'Admin', href: '/admin', icon: Shield, minRole: 'superadmin' as const },
];

const roleHierarchy: Record<string, number> = {
  athlete: 0, coach: 1, org_admin: 2, superadmin: 3,
};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);

  // close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.public) return true;
    if (!isAuthenticated || !user) return false;
    if (!item.minRole) return true;
    return (roleHierarchy[user.role] || 0) >= (roleHierarchy[item.minRole] || 0);
  });

  return (
    <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-lg shadow-black/5">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* logo */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <Image src="/logo.png" alt="Gaya" width={200} height={64} className="h-[48px] w-auto" />
          </Link>

          {/* desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'text-atlas-500 bg-atlas-500/10'
                      : 'text-text-muted hover:text-text-secondary hover:bg-white/40'
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white/70 transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-atlas-500/20 to-blue-500/20 flex items-center justify-center text-[10px] font-bold text-atlas-500">
                    {user.full_name?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs text-text-secondary font-medium max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-text-muted" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-2 shadow-lg shadow-black/5 animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/40 mb-1">
                      <p className="text-sm font-medium text-text-primary">{user.full_name}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-atlas-500/10 text-atlas-500 capitalize">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    <Link
                      href="/coaches/me"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/40 transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-3.5 h-3.5" /> Profile
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/40 transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </Link>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-atlas-500 text-white hover:bg-atlas-600 transition-all shadow-lg shadow-atlas-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-text-muted hover:text-text-secondary transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-white/30 animate-slide-up">
            <div className="space-y-1">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'text-atlas-500 bg-atlas-500/10'
                        : 'text-text-muted hover:text-text-secondary hover:bg-white/40'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
