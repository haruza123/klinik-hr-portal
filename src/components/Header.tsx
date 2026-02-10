import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          Klinik HR
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-slate-600 hover:text-emerald-600 transition-colors">
            Beranda
          </Link>
          <Link href="/admin" className="text-slate-600 hover:text-emerald-600 transition-colors">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
