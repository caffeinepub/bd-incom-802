import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import CountdownBanner from './CountdownBanner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <CountdownBanner />
      <Header />
      <main className={`flex-1 max-w-lg mx-auto w-full px-4 py-4 ${isAuthenticated ? 'pb-24' : 'pb-4'}`}>
        {children}
      </main>
      {isAuthenticated && <BottomNav />}
      <footer className={`text-center py-3 text-xs text-muted-foreground ${isAuthenticated ? 'pb-20' : ''}`}>
        © {new Date().getFullYear()} BD INCOM 802 · Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'bd-incom-802')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
