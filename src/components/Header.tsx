'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/kalkulator', label: 'Kalkulator Pesangon' },
  { href: '/admin', label: 'Admin' },
];

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex h-14 min-h-0 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo - proporsional, tidak tertindih */}
          <Link
            href="/"
            className="min-w-0 shrink-0 text-lg font-semibold tracking-tight text-slate-900 truncate"
            onClick={closeDrawer}
          >
            Klinik HR
          </Link>

          {/* Desktop nav - tampil dari md (768px) */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            className="md:hidden shrink-0 p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors touch-manipulation"
            aria-label={drawerOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={drawerOpen}
          >
            <span className="relative flex h-5 w-6 items-center justify-center">
              <span
                className={cn(
                  'absolute h-0.5 w-5 bg-current rounded-full transition-all duration-200 ease-out',
                  drawerOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0.5'
                )}
              />
              <span
                className={cn(
                  'absolute h-0.5 w-5 bg-current rounded-full transition-all duration-200 ease-out top-1/2 -translate-y-1/2',
                  drawerOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                )}
              />
              <span
                className={cn(
                  'absolute h-0.5 w-5 bg-current rounded-full transition-all duration-200 ease-out',
                  drawerOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0.5'
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Overlay - mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-200',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeDrawer}
        aria-hidden
      />

      {/* Drawer - slide dari kanan */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-[min(100vw-4rem,320px)] bg-white border-l border-slate-200 shadow-xl md:hidden transition-transform duration-300 ease-out',
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Menu navigasi"
        aria-hidden={!drawerOpen}
      >
        <div className="flex flex-col h-full pt-20 pb-8 px-5">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeDrawer}
                className="rounded-xl py-3 px-4 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-slate-100">
            <Link
              href="/login"
              onClick={closeDrawer}
              className="flex items-center justify-center rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
