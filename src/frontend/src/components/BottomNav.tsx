import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Zap, Play, Users, ShieldCheck, Banknote, Dices, Moon, Bell, Smartphone } from 'lucide-react';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';

export default function BottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'ড্যাশবোর্ড' },
    { path: '/spin', icon: Zap, label: 'স্পিন', badge: userProfile ? Number(userProfile.spinsLeft) : null },
    { path: '/videos', icon: Play, label: 'ভিডিও' },
    { path: '/referral', icon: Users, label: 'রেফারেল' },
    { path: '/withdraw', icon: Banknote, label: 'উইথড্র' },
    { path: '/notice', icon: Bell, label: 'নোটিশ' },
    { path: '/recharge', icon: Smartphone, label: 'রিচার্জ' },
    { path: '/ludo', icon: Dices, label: 'লুডু' },
    { path: '/ramadan', icon: Moon, label: 'রমজান' },
    ...(isAdmin ? [{ path: '/admin', icon: ShieldCheck, label: 'অ্যাডমিন' }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex overflow-x-auto scrollbar-hide">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = currentPath === path || (path === '/admin' && currentPath.startsWith('/admin'));
          return (
            <Link
              key={path}
              to={path}
              className={`shrink-0 flex flex-col items-center justify-center py-2 px-2 gap-0.5 transition-colors min-w-[52px] ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge !== null && badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
