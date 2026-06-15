const navItems = [
  { href: '#vision', label: 'Vision' },
  { href: '#casos', label: 'Casos' },
  { href: '#demos', label: 'Demos' },
]

export function Header() {
  return (
    <header className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,_#1d4ed8,_#5ea7ff)] px-3 text-sm font-semibold tracking-[0.14em] text-white shadow-[0_12px_25px_rgba(29,78,216,0.28)]">
            hb
          </div>
          <div>
            <p className="font-[var(--font-heading)] text-lg font-semibold text-slate-900 sm:text-xl">
              hiberus Enterprise Efficiency
            </p>
            <p className="text-sm text-slate-500">
              Deck interactivo sobre automatizacion inteligente para banca
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 self-start lg:self-auto">
          {navItems.map((item) => (
            <a
              key={item.href}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[var(--brand)]/20 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}