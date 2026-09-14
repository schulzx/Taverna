#!/usr/bin/env bash
# ============================================================
#  SÓ O MEU — Taverna
#  Prova a suíte com HEAD + apenas os arquivos que VOCÊ mudou,
#  ignorando o trabalho em voo da outra mente na mesma árvore.
#
#  Existe porque o bastão protege UM arquivo e o perigo é a
#  SUÍTE: uma mente pode ficar vermelha por causa de um teste
#  que a outra está escrevendo, sem que as duas tenham tocado
#  no mesmo arquivo uma única vez.
#
#  Uso:  bash mente/so-o-meu.sh <caminho> [<caminho> ...]
#  Ex.:  bash mente/so-o-meu.sh src/estilo.js testes/teste-estilo.mjs
# ============================================================
set -euo pipefail
[ $# -gt 0 ] || { echo "uso: bash mente/so-o-meu.sh <caminho> [...]"; exit 2; }

RAIZ="$(git rev-parse --show-toplevel)"
LIMPO="$(mktemp -d)"
trap 'rm -rf "$LIMPO"' EXIT

# HEAD puro: o que está publicado, sem o que ninguém commitou ainda
git -C "$RAIZ" archive HEAD | tar -x -C "$LIMPO"

# por cima, só os seus
for f in "$@"; do
  if [ -e "$RAIZ/$f" ]; then
    mkdir -p "$LIMPO/$(dirname "$f")"
    cp "$RAIZ/$f" "$LIMPO/$f"
  else
    rm -f "$LIMPO/$f"   # arquivo que você apagou
  fi
done

echo "── só o meu: HEAD + $# arquivo(s) ──"
cd "$LIMPO" && node testes/rodar-tudo.mjs
