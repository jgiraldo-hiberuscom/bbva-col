import { useState } from 'react'
import type { ReactNode } from 'react'

type DemoSectionProps = {
  children: ReactNode
  onPromptSelect: (prompt: string) => void
}

const demoTabs = [
  {
    id: 'agente-privado',
    label: 'Demo 1',
    subtitle: 'Conversacion en vivo con el agente privado ya conectado a tu IA local.',
    description:
      'Usa esta demo para consultar procesos, pedir narrativas de casos de uso y demostrar respuestas reales sobre el backend local ya integrado.',
    prompt:
      'Explica como ayudarias a un banco a automatizar operativa con un agente privado conectado a IA local.',
  },
  {
    id: 'demo-2',
    label: 'Demo 2',
    subtitle: '',
    description: '',
    prompt: '',
  },
]

export function DemoSection({ children, onPromptSelect }: DemoSectionProps) {
  const [activeTabId, setActiveTabId] = useState(demoTabs[0].id)
  const activeTab = demoTabs.find((tab) => tab.id === activeTabId) ?? demoTabs[0]

  return (
    <section id="demos" className="deck-slide rounded-[30px] border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#fbfcff_100%)] px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] lg:px-8 lg:py-8">
      <div className="rounded-[28px] bg-[linear-gradient(90deg,_#1647ec_0%,_#8cbcff_100%)] px-6 py-5 text-white shadow-[0_20px_45px_rgba(22,71,236,0.14)]">
        <h2 className="font-[var(--font-heading)] text-4xl font-semibold leading-none sm:text-5xl lg:text-[4.2rem]">
          hiberus Enterprise Efficiency
        </h2>
        <p className="mt-2 text-base text-blue-50 sm:text-lg">
          Demos interactivas para transformar tu operativa
        </p>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap gap-3" role="tablist" aria-label="Demos interactivas">
          {demoTabs.map((tab) => (
            <button
              key={tab.id}
              aria-selected={tab.id === activeTab.id}
              className={tab.id === activeTab.id
                ? 'rounded-full border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-5 py-2 text-sm font-semibold text-[var(--brand)] shadow-[0_10px_24px_rgba(22,61,155,0.06)]'
                : 'rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.03)] transition hover:border-[var(--brand)]/20 hover:text-[var(--brand)]'}
              onClick={() => {
                setActiveTabId(tab.id)
                onPromptSelect(tab.prompt)
              }}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 min-w-0">
          {activeTab.id === 'agente-privado' ? (
            children
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#fafcff)] px-6 py-12 text-center text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Demo 2
              </p>
              <p className="mt-3 text-lg font-medium text-slate-600">
                Espacio reservado para la siguiente demo.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}