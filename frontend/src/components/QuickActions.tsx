type CaseStudy = {
  title: string
  value: string
  summary: string
  prompt: string
}

type SuccessCasesSectionProps = {
  actions: CaseStudy[]
  onActionSelect: (action: string) => void
}

export function SuccessCasesSection({ actions, onActionSelect }: SuccessCasesSectionProps) {
  return (
    <section id="casos" className="deck-slide rounded-[30px] border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#fbfcff_100%)] px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] lg:px-8 lg:py-8">
      <div className="rounded-[28px] bg-[linear-gradient(90deg,_#1647ec_0%,_#8cbcff_100%)] px-6 py-5 text-white shadow-[0_20px_45px_rgba(22,71,236,0.14)]">
        <h2 className="font-[var(--font-heading)] text-4xl font-semibold leading-none sm:text-5xl lg:text-[4.2rem]">
          hiberus Enterprise Efficiency
        </h2>
        <p className="mt-2 text-base text-blue-50 sm:text-lg">
          Casos de exito en el sector bancario
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.title}
            className="group rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-[0_10px_26px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-[var(--brand)]/20 hover:shadow-[0_18px_40px_rgba(22,61,155,0.08)]"
            onClick={() => onActionSelect(action.prompt)}
            type="button"
          >
            <div className="flex items-start justify-end gap-4">
              <span className="text-3xl font-semibold text-cyan-500">{action.value}</span>
            </div>
            <p className="mt-4 text-xl font-semibold text-slate-900">{action.title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              {action.summary}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}