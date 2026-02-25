#!/bin/bash
# Hook: PreToolUse — ltrc-ps
# Bloquea escritura sobre archivos sensibles del proyecto

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Archivos protegidos — no sobrescribir sin confirmación explícita
PROTECTED=(
  ".env"
  ".env.local"
  ".env.production"
  "package-lock.json"
  "nx.json"
  "docker-compose.yml"
)

for protected in "${PROTECTED[@]}"; do
  if [[ "$FILE_PATH" == *"$protected" ]]; then
    echo "BLOQUEADO: '$FILE_PATH' es un archivo sensible. Confirmá la acción explícitamente." >&2
    exit 2
  fi
done

exit 0
