import { useState } from 'react'

import { ChatPanel } from './components/ChatPanel'
import { DemoSection } from './components/DemoSection'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { SuccessCasesSection } from './components/QuickActions'

const caseStudies = [
  {
    title: 'Banco Digital-First (BPO core)',
    value: 'Core',
    summary:
      'Automatiza cancelacion de credito, garantias bancarias, reliquidacion de reclamaciones y requerimientos juridicos para convertir una operacion manual en flujos trazables, sin errores y con mayor cumplimiento.',
    prompt:
      'Explica el caso Banco Digital-First con automatizacion de procesos core bancarios y el valor operativo que aporta.',
  },
  {
    title: 'Eficiencia operativa con Process Mining, RPA y Low Code',
    value: 'PM+RPA',
    summary:
      'Combina Celonis, BluePrism y Appian para plataforma de compras, alta de acreedores, homologacion de proveedores y planificacion fiscal, entendiendo primero el proceso real y automatizando despues lo repetitivo.',
    prompt:
      'Resume el caso de eficiencia operativa con Process Mining, RPA y Low Code y como se combinan Celonis, BluePrism y Appian.',
  },
  {
    title: 'Automatizacion de facturas y CAE',
    value: 'CAE',
    summary:
      'Procesa automaticamente facturas de proveedores y coordinacion de actividades empresariales desde la captura hasta la validacion e integracion, eliminando la introduccion y cotejo manual de datos.',
    prompt:
      'Describe el caso de automatizacion de facturas y CAE y el valor de control y trazabilidad de extremo a extremo.',
  },
  {
    title: 'Agente + RPA sobre core legacy (AS/400), 100% privado',
    value: 'AS/400',
    summary:
      'Un agente conversacional entiende la peticion y orquesta un bot RPA sobre AS/400 para login, navegacion, extraccion y actualizacion de datos, sin reescribir el core ni sacar el dato del banco.',
    prompt:
      'Explica el caso de un agente privado con RPA operando AS/400 y por que permite abrir legacy a la IA sin mover el dato fuera del banco.',
  },
  {
    title: 'Agente de apoyo al onboarding de clientes',
    value: 'KYC',
    summary:
      'Acompana el alta de cliente de principio a fin, recopilando y validando documentacion, haciendo verificacion de identidad y guiando cada paso para reducir friccion y abandono.',
    prompt:
      'Cuenta el caso de un agente de apoyo al onboarding de clientes y su impacto en KYC, abandono y gestion documental.',
  },
  {
    title: 'Agente de cumplimiento AML/SARLAFT',
    value: 'AML',
    summary:
      'Realiza screening contra listas de sanciones, detecta operaciones sospechosas y prepara borradores de reportes regulatorios con trazabilidad completa para reforzar el cumplimiento.',
    prompt:
      'Explica el caso de un agente de cumplimiento AML y SARLAFT con screening, deteccion de operaciones sospechosas y reportes regulatorios.',
  },
  {
    title: 'Agente anonimizador de datos',
    value: 'Privacy',
    summary:
      'Detecta y enmascara datos personales en grabaciones, transcripciones y documentos para permitir IA y analitica cumpliendo Habeas Data desde el diseno y sin exponer datos sensibles.',
    prompt:
      'Resume el caso de un agente anonimizador de datos para llamadas y documentos con foco en privacidad y cumplimiento.',
  },
  {
    title: 'Automatizacion inteligente de hojas de calculo',
    value: 'Sheets',
    summary:
      'Lee, valida y consolida cuadres, conciliaciones, controles y reportes mantenidos en hojas de calculo, cruzando la informacion con los sistemas del banco y generando una version final trazable y gobernada.',
    prompt:
      'Explica el caso de automatizacion inteligente de hojas de calculo y como elimina trabajo manual en cierres, conciliaciones y reportes.',
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
