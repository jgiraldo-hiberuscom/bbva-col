from __future__ import annotations

import asyncio
import uuid

from config import load_settings
from runtime import LocalAgentRuntime


async def main() -> None:
    settings = load_settings()
    runtime = LocalAgentRuntime(settings)
    conversation_id = str(uuid.uuid4())

    print("Agente privado local iniciado.")
    print("Escribe 'salir', 'exit' o 'quit' para terminar.")

    while True:
        user_input = input("\nTu> ").strip()
        if not user_input:
            continue
        if user_input.lower() in {"salir", "exit", "quit"}:
            print("Saliendo.")
            return

        try:
            answer, _ = await runtime.chat(
                message=user_input,
                conversation_id=conversation_id,
            )
        except Exception as exc:
            print(f"\nAgente> Error ejecutando el agente: {exc}")
            continue

        if not answer:
            answer = "No se recibio contenido del modelo."

        print(f"\nAgente> {answer}")


if __name__ == "__main__":
    asyncio.run(main())