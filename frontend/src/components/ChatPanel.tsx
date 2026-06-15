import { startTransition, useEffect, useId, useRef, useState } from 'react'

import { sendChatMessage } from '../services/agentClient'

type ChatPanelProps = {
  queuedPrompt: string | null
  onQueuedPromptHandled: () => void
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

type AgentBuildOption = {
  id: string
  label: string
  description: string
  badge: string
}

type AgentBuildStep = {
  id: string
  title: string
  icon: 'platform' | 'model' | 'actions' | 'integrations'
  description: string
  options: AgentBuildOption[]
}

type BuildStepId = AgentBuildStep['id']

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function isEmployeeProductsQuery(message: string) {
  const normalizedMessage = normalizeText(message)
  const productTerms = ['producto', 'productos', 'portafolio', 'tenencia', 'tenencias', 'activos']
  const employeeTerms = ['empleado', 'cliente', 'colaborador', 'usuario']

  return productTerms.some((term) => normalizedMessage.includes(term))
    && employeeTerms.some((term) => normalizedMessage.includes(term))
}

function getLoadingMessage(message: string) {
  if (isEmployeeProductsQuery(message)) {
    return 'Consultando RPA de productos del empleado...'
  }

  return 'Pensando...'
}

const agentBuildSteps: AgentBuildStep[] = [
  {
    id: 'platform',
    title: 'Plataforma',
    icon: 'platform',
    description: 'Selecciona la plataforma agentica sobre la que se construye la experiencia.',
    options: [
      { id: 'local-agent', label: 'Agente local', description: 'Runtime privado dentro de tu entorno', badge: 'Demo' },
      { id: 'openai-agents', label: 'OpenAI Agents', description: 'Experiencia agentica gestionada', badge: 'Cloud' },
      { id: 'google-agents', label: 'Google Agents', description: 'Orquestacion agentica en ecosistema Google', badge: 'Cloud' },
      { id: 'copilot-studio', label: 'Copilot Studio', description: 'Agentes empresariales low-code', badge: 'Enterprise' },
    ],
  },
  {
    id: 'model',
    title: 'Modelo',
    icon: 'model',
    description: 'Define el motor de razonamiento que consumira el agente.',
    options: [],
  },
  {
    id: 'tools',
    title: 'Acciones',
    icon: 'actions',
    description: 'Añade las herramientas y automatizaciones que el agente puede ejecutar.',
    options: [
      { id: 'rpa', label: 'RPA', description: 'Automatizacion sobre interfaces y legado', badge: 'Legacy' },
      { id: 'power-automate', label: 'Power Automate', description: 'Flujos empresariales en ecosistema Microsoft', badge: 'Flow' },
      { id: 'n8n', label: 'n8n', description: 'Orquestacion flexible de procesos', badge: 'OSS' },
      { id: 'function-calling', label: 'Function calling', description: 'Acciones nativas expuestas por APIs', badge: 'API' },
    ],
  },
  {
    id: 'integration',
    title: 'Integracion',
    icon: 'integrations',
    description: 'Conecta el agente con las herramientas y sistemas reales donde opera la compania.',
    options: [],
  },
]

const modelOptionsByPlatform: Record<string, AgentBuildOption[]> = {
  'local-agent': [
    { id: 'qwen-local', label: 'Qwen local', description: 'Inferencia privada con despliegue local', badge: 'Local' },
    { id: 'gemma-local', label: 'Gemma', description: 'Modelo abierto de Google ejecutado en local', badge: 'Local' },
    { id: 'ollama-local', label: 'Ollama', description: 'Runtime local para servir modelos en tu entorno', badge: 'Runtime' },
  ],
  'openai-agents': [
    { id: 'gpt-4o', label: 'GPT-4o', description: 'Modelo multimodal de alta capacidad para agentes', badge: 'OpenAI' },
    { id: 'gpt-4.1', label: 'GPT-4.1', description: 'Modelo generalista para tareas complejas', badge: 'OpenAI' },
    { id: 'o4-mini', label: 'o4-mini', description: 'Razonamiento compacto para flujos agenciales', badge: 'Reasoning' },
  ],
  'google-agents': [
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Modelo premium de Google para agentes avanzados', badge: 'Google' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Respuesta rapida para interacciones de alto volumen', badge: 'Google' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Alternativa de contexto amplio dentro del ecosistema Google', badge: 'Google' },
  ],
  'copilot-studio': [
    { id: 'copilot-gpt-4o', label: 'GPT-4o en Copilot', description: 'Modelo disponible en experiencias empresariales de Copilot', badge: 'M365' },
    { id: 'copilot-gpt-4.1', label: 'GPT-4.1 en Copilot', description: 'Capacidad avanzada para agentes low-code', badge: 'M365' },
    { id: 'copilot-tenant-model', label: 'Modelo del tenant', description: 'Configuracion gobernada dentro del entorno corporativo', badge: 'Enterprise' },
  ],
}

const defaultIntegrationOptions: AgentBuildOption[] = [
  { id: 'sharepoint', label: 'SharePoint API', description: 'Documentacion, conocimiento y ficheros', badge: 'M365' },
  { id: 'gmail', label: 'Gmail API', description: 'Buzones y automatizacion de correo', badge: 'Mail' },
  { id: 'erp-crm', label: 'ERPs y CRMs', description: 'Aplicaciones core del negocio', badge: 'Core' },
]

const rpaIntegrationOptions: AgentBuildOption[] = [
  { id: 'as400', label: 'AS400', description: 'Acceso a legado sin reescritura inmediata', badge: 'Legacy' },
  { id: 'erp-crm', label: 'ERPs y CRMs', description: 'Aplicaciones core del negocio', badge: 'Core' },
]

function getBuildOptions(stepId: BuildStepId, selectedBuildOptions: Record<string, string>) {
  if (stepId === 'model') {
    return modelOptionsByPlatform[selectedBuildOptions.platform] ?? []
  }

  if (stepId === 'integration') {
    return selectedBuildOptions.tools === 'rpa' ? rpaIntegrationOptions : defaultIntegrationOptions
  }

  return agentBuildSteps.find((step) => step.id === stepId)?.options ?? []
}

function isSelectedOptionValid(stepId: BuildStepId, selectedBuildOptions: Record<string, string>) {
  const selectedOptionId = selectedBuildOptions[stepId]
  if (!selectedOptionId) {
    return false
  }

  return getBuildOptions(stepId, selectedBuildOptions).some((option) => option.id === selectedOptionId)
}

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Secure AI Assistant listo. Puedo ayudarte a consultar flujos internos, revisar politicas y resumir informacion operativa.',
  },
]

function StepIcon({ icon, active }: { icon: AgentBuildStep['icon']; active: boolean }) {
  const strokeClass = active ? 'stroke-white' : 'stroke-current'

  if (icon === 'platform') {
    return (
      <svg aria-hidden="true" className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24">
        <rect className={strokeClass} rx="2.5" ry="2.5" strokeWidth="1.8" x="3.5" y="4.5" width="17" height="11" />
        <path className={strokeClass} strokeWidth="1.8" strokeLinecap="round" d="M8 19.5h8" />
        <path className={strokeClass} strokeWidth="1.8" strokeLinecap="round" d="M12 15.5v4" />
      </svg>
    )
  }

  if (icon === 'model') {
    return (
      <svg aria-hidden="true" className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24">
        <rect className={strokeClass} rx="4" ry="4" strokeWidth="1.8" x="6" y="6" width="12" height="12" />
        <path className={strokeClass} strokeWidth="1.8" strokeLinecap="round" d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7" />
      </svg>
    )
  }

  if (icon === 'actions') {
    return (
      <svg aria-hidden="true" className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24">
        <path className={strokeClass} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M6.5 7.5 3.5 12l3 4.5M17.5 7.5l3 4.5-3 4.5M9.5 18l5-12" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24">
      <path className={strokeClass} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v6m0 0 3-3m-3 3-3-3M6 13.5v4h12v-4" />
      <rect className={strokeClass} rx="2.5" ry="2.5" strokeWidth="1.8" x="4.5" y="15.5" width="15" height="4" />
    </svg>
  )
}

export function ChatPanel({ queuedPrompt, onQueuedPromptHandled }: ChatPanelProps) {
  const formId = useId()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [currentBuildStepIndex, setCurrentBuildStepIndex] = useState(0)
  const [selectedBuildOptions, setSelectedBuildOptions] = useState<Record<string, string>>({})
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Pensando...')
  const [conversationId, setConversationId] = useState<string | undefined>()
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const activeBuildStep = agentBuildSteps[currentBuildStepIndex] ?? agentBuildSteps[agentBuildSteps.length - 1]
  const activeBuildStepOptions = getBuildOptions(activeBuildStep.id, selectedBuildOptions)
  const completedStepsCount = agentBuildSteps.filter((step) => isSelectedOptionValid(step.id, selectedBuildOptions)).length
  const buildComplete = agentBuildSteps.every((step) => selectedBuildOptions[step.id])
  const buildProgress = (completedStepsCount / agentBuildSteps.length) * 100

  useEffect(() => {
    if (!queuedPrompt || isLoading) {
      return
    }

    setInput(queuedPrompt)
    void handleSend(queuedPrompt)
    onQueuedPromptHandled()
  }, [isLoading, onQueuedPromptHandled, queuedPrompt])

  async function handleSend(rawMessage?: string) {
    const message = (rawMessage ?? input).trim()
    if (!message || isLoading) {
      return
    }

    setError(null)
    setLoadingMessage(getLoadingMessage(message))
    setIsLoading(true)
    const nextConversationId = conversationId ?? crypto.randomUUID()
    if (!conversationId) {
      setConversationId(nextConversationId)
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: message,
    }

    setMessages((current) => [...current, userMessage])
    setInput('')

    try {
      const response = await sendChatMessage({
        conversationId: nextConversationId,
        message,
      })

      startTransition(() => {
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: response.answer,
          },
        ])
      })
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError.message
          : 'No fue posible conectar con el agente privado.'

      setError(nextError)
    } finally {
      setIsLoading(false)
      setLoadingMessage('Pensando...')
    }
  }

  function handleComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  function handleResetConversation() {
    setMessages(initialMessages)
    setConversationId(undefined)
    setInput('')
    setError(null)
    textAreaRef.current?.focus()
  }

  function handleBuildOptionSelect(stepId: string, optionId: string) {
    setSelectedBuildOptions((current) => {
      const nextSelections = {
        ...current,
        [stepId]: optionId,
      }

      if (stepId === 'platform' && !isSelectedOptionValid('model', nextSelections)) {
        delete nextSelections.model
      }

      if (stepId === 'tools' && !isSelectedOptionValid('integration', nextSelections)) {
        delete nextSelections.integration
      }

      return nextSelections
    })

    const stepIndex = agentBuildSteps.findIndex((step) => step.id === stepId)
    if (stepIndex >= 0 && stepIndex < agentBuildSteps.length - 1) {
      setCurrentBuildStepIndex(stepIndex + 1)
      return
    }

    setCurrentBuildStepIndex(agentBuildSteps.length - 1)
  }

  return (
    <aside className="w-full overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f7f9fc_100%)] shadow-[0_28px_60px_rgba(15,23,42,0.1)] xl:min-h-[840px]">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_36%),linear-gradient(145deg,_#14388f_0%,_#102d73_52%,_#0c1d47_100%)] px-5 py-5 text-white sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-blue-100/70">
              Secure channel
            </p>
            <h2 className="mt-2 font-[var(--font-heading)] text-[1.55rem] font-semibold leading-tight text-white sm:text-[1.7rem]">
              Secure AI Assistant
            </h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-blue-50/80">
              Conversacion privada para operaciones internas, consultas seguras y asistencia guiada.
            </p>
          </div>

          <button
            className="rounded-2xl border border-white/15 bg-white/8 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:bg-white/14"
            onClick={handleResetConversation}
            type="button"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fbff_100%)] shadow-[0_18px_38px_rgba(15,23,42,0.06)]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.16),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]/65">
                  Construccion guiada
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  Monta el agente paso a paso antes de abrir la conversacion.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand)] shadow-[0_8px_18px_rgba(22,61,155,0.08)]">
                Builder demo
              </span>
            </div>

            <div className="mt-4 rounded-[22px] bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">
                  {buildComplete ? 'Builder completado.' : `Paso ${Math.min(currentBuildStepIndex + 1, agentBuildSteps.length)} de ${agentBuildSteps.length}`}
                </p>
                <div className="flex items-center gap-2">
                  {completedStepsCount > 0 ? (
                    <button
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-[var(--brand)]/20 hover:text-[var(--brand)]"
                      onClick={() => {
                        setSelectedBuildOptions({})
                        setCurrentBuildStepIndex(0)
                      }}
                      type="button"
                    >
                      Reiniciar builder
                    </button>
                  ) : null}
                  <span className={buildComplete
                    ? 'rounded-full bg-emerald-100 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-emerald-700'
                    : 'rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]'}>
                    {buildComplete ? '100% listo' : `${Math.round(buildProgress)}% completado`}
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,_#1d4ed8_0%,_#60a5fa_100%)] transition-[width] duration-300"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Secuencia del builder
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Cada paso activa el siguiente hasta dejar el agente operativo.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              4 capas
            </span>
          </div>

          <div className="grid gap-3 xl:grid-cols-4">
            {agentBuildSteps.map((step, index) => {
              const isComplete = Boolean(selectedBuildOptions[step.id])
              const isActive = activeBuildStep.id === step.id && !buildComplete

              return (
                <button
                  key={step.id}
                  className={isComplete
                    ? 'relative rounded-[26px] border border-emerald-200 bg-[linear-gradient(180deg,_#ffffff,_#effcf4)] p-4 text-left shadow-[0_12px_28px_rgba(16,185,129,0.08)] transition'
                    : isActive
                      ? 'relative rounded-[26px] border border-[var(--brand)]/30 bg-[linear-gradient(180deg,_#ffffff,_#eef5ff)] p-4 text-left shadow-[0_16px_32px_rgba(22,61,155,0.12)] transition'
                      : 'relative rounded-[26px] border border-slate-200 bg-white p-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.03)] transition hover:border-[var(--brand)]/18 hover:shadow-[0_12px_24px_rgba(22,61,155,0.06)]'}
                  onClick={() => setCurrentBuildStepIndex(index)}
                  type="button"
                >
                  {index < agentBuildSteps.length - 1 ? (
                    <div className="absolute -right-2 top-1/2 hidden h-[2px] w-4 -translate-y-1/2 bg-[var(--brand)]/25 xl:block" />
                  ) : null}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className={isComplete
                          ? 'flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white'
                          : isActive
                            ? 'flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8,_#60a5fa)] text-white shadow-[0_10px_20px_rgba(29,78,216,0.25)]'
                            : 'flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500'}>
                          <StepIcon icon={step.icon} active={isComplete || isActive} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                      </div>
                    </div>
                    <div className={isComplete
                      ? 'flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-semibold text-white'
                      : isActive
                        ? 'flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#1d4ed8,_#60a5fa)] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(29,78,216,0.25)]'
                        : 'flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500'}>
                      {isComplete ? 'OK' : `0${index + 1}`}
                    </div>
                  </div>

                  <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {isComplete ? 'Completado' : isActive ? 'Paso activo' : 'Pendiente'}
                  </p>
                </button>
              )
            })}
          </div>

          {!buildComplete ? (
          <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f5f9ff_100%)] shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
            <div className="bg-[linear-gradient(90deg,_rgba(29,78,216,0.08),_rgba(96,165,250,0.02))] px-4 py-3 sm:px-5">
              <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]/65">
                  Paso activo
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  {currentBuildStepIndex + 1}. {activeBuildStep.title}
                </h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--brand)] shadow-[0_8px_18px_rgba(22,61,155,0.06)]">
                <StepIcon icon={activeBuildStep.icon} active={false} />
              </div>
            </div>
            </div>

            <div className="px-4 py-4 sm:px-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {activeBuildStepOptions.map((option) => {
                const isSelected = selectedBuildOptions[activeBuildStep.id] === option.id

                return (
                  <button
                    key={option.id}
                    className={isSelected
                      ? 'rounded-[22px] border border-[var(--brand)]/25 bg-[linear-gradient(180deg,_#ffffff,_#edf5ff)] px-4 py-4 text-left shadow-[0_14px_28px_rgba(22,61,155,0.1)] transition'
                      : 'rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-[var(--brand)]/20 hover:bg-[linear-gradient(180deg,_#ffffff,_#f8fbff)] hover:shadow-[0_10px_22px_rgba(22,61,155,0.05)]'}
                    onClick={() => handleBuildOptionSelect(activeBuildStep.id, option.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                      <span className={isSelected
                        ? 'rounded-full bg-white px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]'
                        : 'rounded-full bg-slate-100 px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-slate-500'}>
                        {option.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
                  </button>
                )
              })}
            </div>
            {activeBuildStepOptions.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                Selecciona primero la plataforma para ver los modelos disponibles.
              </div>
            ) : null}
            </div>
          </div>
          ) : null}
          </div>
        </div>

        <div className={buildComplete
          ? 'rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fbff)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition'
          : 'rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fbff)] p-3 opacity-55 blur-[0.2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition'}>
          <div className="mb-3 flex items-center justify-between gap-3 rounded-[22px] bg-slate-50 px-4 py-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Conversation
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {buildComplete ? 'Agente construido. Conversacion habilitada.' : `Completa ${agentBuildSteps.length - completedStepsCount} paso(s) para habilitar la conversacion.`}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className={buildComplete ? 'h-2 w-2 rounded-full bg-emerald-500' : 'h-2 w-2 rounded-full bg-amber-500'} />
              {buildComplete ? 'Ready' : 'Waiting builder'}
            </span>
          </div>

          <div className="max-h-[620px] min-h-[480px] space-y-3 overflow-y-auto pr-1 xl:min-h-[560px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === 'assistant' ? 'chat-row chat-row-assistant' : 'chat-row chat-row-user'}
              >
                <div className="chat-avatar" aria-hidden="true">
                  {message.role === 'assistant' ? 'AI' : 'TU'}
                </div>
                <div
                  className={message.role === 'assistant' ? 'chat-bubble chat-bubble-assistant' : 'chat-bubble chat-bubble-user'}
                >
                  <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-70">
                    {message.role === 'assistant' ? 'Secure AI Assistant' : 'Operador'}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="chat-row chat-row-assistant">
                <div className="chat-avatar" aria-hidden="true">
                  AI
                </div>
                <div className="chat-bubble chat-bubble-assistant">
                  <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] opacity-70">
                    Secure AI Assistant
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--brand)]" />
                    {loadingMessage}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              'Resume las alertas abiertas',
              'Consulta una API interna',
              'Valida una solicitud operativa',
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[var(--brand)]/20 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                onClick={() => setInput(suggestion)}
                disabled={!buildComplete}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>

      <form
        className="space-y-4"
        id={formId}
        onSubmit={(event) => {
          event.preventDefault()
          void handleSend()
        }}
      >
        <label className="sr-only" htmlFor={`${formId}-textarea`}>
          Mensaje para el agente
        </label>
        <textarea
          id={`${formId}-textarea`}
          ref={textAreaRef}
          className="min-h-[148px] w-full resize-none rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:bg-white focus:ring-4 focus:ring-[var(--brand-soft)]"
          disabled={!buildComplete}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder={buildComplete ? 'Escribe una consulta para tu agente privado...' : 'Completa el builder para habilitar la conversacion...'}
          value={input}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Usa Enter para enviar y Shift + Enter para nueva linea.
          </p>
          <button
            className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(22,61,155,0.24)] transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!buildComplete || isLoading || input.trim().length === 0}
            type="submit"
          >
            Enviar al agente
          </button>
        </div>
      </form>
        </div>
      </div>
    </aside>
  )
}