export type ChatRequest = {
  message: string
  conversationId?: string
}

export type ChatResponse = {
  answer: string
}

const rawApiUrl = import.meta.env.VITE_AGENT_API_URL?.trim() ?? ''
const apiUrl = rawApiUrl.replace(/\/+$/, '')
const mockMode = import.meta.env.VITE_AGENT_API_MOCK === 'true' || apiUrl.length === 0

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  if (mockMode) {
    return mockChatMessage(payload)
  }

  const response = await fetch(`${apiUrl}/chat`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  if (!response.ok) {
    let errorMessage = `El agente devolvio un error HTTP ${response.status}.`

    try {
      const errorPayload = (await response.json()) as { detail?: string }
      if (typeof errorPayload.detail === 'string' && errorPayload.detail.trim()) {
        errorMessage = errorPayload.detail
      }
    } catch {
      // Keep the generic HTTP message when the response is not JSON.
    }

    throw new Error(errorMessage)
  }

  const data = (await response.json()) as Partial<ChatResponse>
  if (typeof data.answer !== 'string' || data.answer.trim().length === 0) {
    throw new Error('La respuesta del agente no contiene un campo answer valido.')
  }

  return { answer: data.answer }
}

async function mockChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 900))

  return {
    answer: [
      'Modo mock activo.',
      `He recibido tu mensaje: "${payload.message}".`,
      'Cuando tu backend este disponible, desactiva VITE_AGENT_API_MOCK y apuntalo a tu endpoint interno /chat.',
    ].join(' '),
  }
}