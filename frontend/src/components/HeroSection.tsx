import heroBotVideo from '../../../resources/h-bot-blue.mp4'

const benefits = [
  'Optimizacion de procesos con Process Mining',
  'Robotizacion de tareas repetitivas',
  'Modelado de procesos con BPMN',
  'Agentes IA que toman decisiones, orquestan y ejecutan',
  'Implantacion continua con ciclo de mejora',
]

const impactMetrics = [
  { label: 'Reduccion coste operativo', value: '30-50%' },
  { label: 'Reduccion TMO tareas rutinarias', value: '+60%' },
  { label: 'Aumento de calidad', value: '>90%' },
  { label: 'Satisfaccion del cliente gracias IA', value: '+10p' },
]

export function HeroSection() {
  return (
    <section id="vision" className="deck-slide overflow-hidden rounded-[30px] bg-white px-5 py-5 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
      <div className="rounded-[28px] bg-[linear-gradient(90deg,_#1647ec_0%,_#8cbcff_100%)] px-6 py-5 text-white shadow-[0_20px_45px_rgba(22,71,236,0.18)]">
        <h1 className="font-[var(--font-heading)] text-4xl font-semibold leading-none sm:text-5xl lg:text-[4.2rem]">
          hiberus Enterprise Efficiency
        </h1>
        <p className="mt-2 text-base text-blue-50 sm:text-lg">
          ¿Sabes cuanto estas dejando de ganar por no transformar tu operativa?
        </p>
      </div>

      <div className="mt-5 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f6f8fc)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <p className="text-[1.7rem] leading-[1.55] text-slate-600 sm:text-[2rem] lg:text-[2.25rem]">
          La operativa empresarial evoluciona hacia un{' '}
          <strong className="font-semibold text-slate-800">modelo digital y autonomo</strong>. Nuestra propuesta combina RPA,
          Process Mining, Agentes de IA y Plataformas Low Code para{' '}
          <strong className="font-semibold text-slate-800">
            entregar operaciones con menos coste, mas calidad y capacidad de adaptacion continua.
          </strong>
        </p>
      </div>

      <div className="mt-6">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
          <div className="relative flex min-h-[250px] items-center justify-center">
            <video
              autoPlay
              className="relative z-10 block w-[220px] object-contain"
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src={heroBotVideo} type="video/mp4" />
            </video>
          </div>

          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 text-slate-700">
                <span className="mt-1 text-lg text-[var(--brand)]">✦</span>
                <p className="text-xl leading-8 sm:text-[1.7rem] sm:leading-[1.45]">
                  <strong className="font-semibold text-slate-900">{benefit.split(' ')[0]}</strong>
                  {benefit.startsWith('Agentes') ? ` ${benefit.slice('Agentes'.length)}` : benefit.startsWith('Implantacion') ? ` ${benefit.slice('Implantacion'.length)}` : benefit.startsWith('Optimizacion') ? ` ${benefit.slice('Optimizacion'.length)}` : benefit.startsWith('Robotizacion') ? ` ${benefit.slice('Robotizacion'.length)}` : benefit.startsWith('Modelado') ? ` ${benefit.slice('Modelado'.length)}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[30px] border border-[var(--brand)]/35 bg-[linear-gradient(180deg,_#ffffff,_#f4f8ff)] p-5 shadow-[0_14px_32px_rgba(22,61,155,0.06)]">
        <div className="mb-4 inline-flex rounded-full bg-[linear-gradient(90deg,_#1d4ed8,_#90b7ff)] px-5 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Impacto
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {impactMetrics.map((metric) => (
            <div key={metric.label} className="rounded-[22px] bg-white px-5 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <p className="text-5xl font-semibold leading-none text-cyan-500 sm:text-6xl">{metric.value}</p>
              <p className="mt-3 max-w-[15ch] text-xl leading-7 text-slate-700">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}