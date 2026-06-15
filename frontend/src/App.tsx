import { useState } from 'react'

import { ChatPanel } from './components/ChatPanel'
import { DemoSection } from './components/DemoSection'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { SuccessCasesSection } from './components/QuickActions'

const caseStudies = [
  {
    title: 'Onboarding y operaciones retail',
    value: '30-50%',
    summary:
      'Reduccion del coste operativo en aperturas, validaciones documentales y backoffice de oficinas.',
    prompt:
      'Explica un caso de uso de onboarding retail con IA, BPMN y automatizacion para banca.',
  },
  {
    title: 'Contact center y servicing',
    value: '+60%',
    summary:
      'Menos tiempo medio operativo en consultas de cliente, incidencias y trazabilidad de gestiones.',
    prompt:
      'Resume un caso de exito de contact center bancario con agente privado y automatizacion.',
  },
  {
    title: 'Riesgos, fraude y compliance',
    value: '>90%',
    summary:
      'Incremento de calidad en revisiones, scoring asistido y orquestacion de evidencias regulatorias.',
    prompt:
      'Dame un caso de uso bancario para compliance y fraude con agentes de IA y process mining.',
  },
  {
    title: 'Experiencia de cliente premium',
    value: '+10p',
    summary:
      'Mayor satisfaccion gracias a respuestas consistentes, contexto operativo y ejecucion guiada.',
    prompt:
      'Propone una demo de experiencia de cliente premium para banca usando un agente privado.',
  },
]

function App() {
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-3 py-3 text-slate-900 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1480px] rounded-[32px] border border-white/70 bg-white/92 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-4 lg:p-6">
        <Header />

        <main className="mt-4 space-y-8 lg:mt-6 lg:space-y-10">
          <HeroSection />
          <SuccessCasesSection actions={caseStudies} onActionSelect={setQueuedPrompt} />
          <DemoSection onPromptSelect={setQueuedPrompt}>
            <ChatPanel
              queuedPrompt={queuedPrompt}
              onQueuedPromptHandled={() => setQueuedPrompt(null)}
            />
          </DemoSection>
        </main>
      </div>
    </div>
  )
}

export default App
