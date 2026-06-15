# Agente privado local con Microsoft Agent Framework

Proyecto Python minimo para ejecutar un agente local usando Microsoft Agent Framework y un endpoint LiteLLM compatible con OpenAI.

## Estructura

- `README.md`
- `requirements.txt`
- `.env.example`
- `src/main.py`
- `src/config.py`
- `src/tools/http_tool.py`

## Requisitos

- Python 3.10 o superior
- Un endpoint LiteLLM compatible con OpenAI accesible desde la red privada

Ejemplo de endpoint:

```text
http://localhost:4000/v1
```

## Instalacion

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Configuracion

1. Copia `.env.example` a `.env`.
2. Ajusta los valores de LiteLLM y la allowlist.

Variables principales:

- `COPILOT_PROVIDER_BASE_URL`: URL base del endpoint OpenAI-compatible de LiteLLM.
- `COPILOT_PROVIDER_API_KEY`: clave del endpoint LiteLLM.
- `COPILOT_MODEL`: nombre del modelo expuesto por LiteLLM.
- `ALLOWED_HTTP_HOSTS`: lista separada por comas de hosts permitidos para la tool HTTP.
- `HTTP_TIMEOUT_SECONDS`: timeout de la peticion GET.
- `HTTP_MAX_RESPONSE_CHARS`: limite maximo de texto devuelto por la tool.
- `AGENT_API_HOST`: host local del backend HTTP del agente.
- `AGENT_API_PORT`: puerto local del backend HTTP del agente.
- `AGENT_API_CORS_ALLOWED_ORIGINS`: origenes permitidos para el frontend web.

Tambien se mantiene compatibilidad con `LITELLM_BASE_URL`, `LITELLM_API_KEY` y `LITELLM_MODEL`, pero el proyecto prioriza tus variables `COPILOT_*` si existen ambas.

## Ejecucion

```powershell
.\.venv\Scripts\python src\main.py
```

## Backend HTTP para el frontend

Para usar el frontend web sin mock, levanta el backend del agente asi:

```powershell
.\.venv\Scripts\python src\server.py
```

Endpoint expuesto:

```text
POST http://127.0.0.1:8000/chat
```

Payload:

```json
{
	"message": "texto del usuario",
	"conversationId": "id-opcional"
}
```

Respuesta:

```json
{
	"answer": "respuesta del agente",
	"conversationId": "id-de-conversacion"
}
```

## Frontend web

El frontend ya esta preparado para apuntar al backend local del agente.

```powershell
Set-Location frontend
npm install
npm run dev
```

Por defecto usa:

- `VITE_AGENT_API_URL=http://127.0.0.1:8000`
- `VITE_AGENT_API_MOCK=false`

Si quieres probar solo la UI sin backend, cambia `VITE_AGENT_API_MOCK=true`.

Salir de la CLI:

- `salir`
- `exit`
- `quit`

## Como funciona la allowlist

La tool `hacer_http_request` solo permite peticiones GET a hosts incluidos en `ALLOWED_HTTP_HOSTS`.

Ejemplo:

```env
ALLOWED_HTTP_HOSTS=localhost,api.interna.local,servicio.corp
```

Notas:

- Solo se aceptan esquemas `http` y `https`.
- Si el host no esta en la allowlist, la tool rechaza la llamada.
- La comprobacion permite coincidencia exacta y subdominios del host permitido.

## Garantias de ejecucion local/privada

- El agente usa `OpenAIChatClient` apuntando a `LITELLM_BASE_URL`, no a Azure OpenAI ni al servicio publico de OpenAI.
- No se usa web search ni herramientas hosted.
- La unica herramienta incluida es una peticion HTTP GET controlada por allowlist.
- La conversacion se mantiene solo en memoria mediante una sesion del framework.
- No se guarda historial por defecto.
- Se desactiva la exportacion de telemetria OpenTelemetry en el proceso.
- El frontend se conecta a un backend local configurable y no incluye analytics ni tracking externos.

## Limitaciones de esta primera version

- La tool HTTP solo hace `GET` y devuelve texto truncado.
- No hay persistencia de conversaciones entre ejecuciones.
- No hay interfaz web ni modo servidor; la interaccion es por consola.
- La seguridad de red depende de una allowlist bien configurada y del aislamiento del entorno.
- Si LiteLLM no esta disponible o el modelo no soporta tool calling, la experiencia del agente se vera limitada.

## Ajustes utiles

- Cambia la allowlist en `.env` para autorizar nuevos hosts internos.
- Ajusta `HTTP_TIMEOUT_SECONDS` si tus endpoints internos responden mas lento.
- Ajusta `HTTP_MAX_RESPONSE_CHARS` si necesitas respuestas mas cortas o mas largas.

## Referencia tecnica

El codigo se adapto a la API actual de `agent-framework` 1.8.x, validando el uso de:

- `agent_framework.Agent`
- `agent_framework.openai.OpenAIChatClient`
- `Agent.create_session()`
- `AgentResponse.text`
