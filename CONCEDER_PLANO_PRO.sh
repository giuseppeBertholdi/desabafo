#!/bin/bash

# Script para conceder plano PRO ao giuseppe.bertholdi@gmail.com
# Executar após o deploy em produção

echo "🎯 Concedendo plano PRO para giuseppe.bertholdi@gmail.com..."
echo ""

# URL de produção
PROD_URL="https://desabafo.site"

# Fazer a requisição
curl -X POST "$PROD_URL/api/admin/grant-pro" \
  -H "Content-Type: application/json" \
  -d '{"email":"giuseppe.bertholdi@gmail.com","planType":"monthly"}' \
  -w "\n\nStatus HTTP: %{http_code}\n" \
  -s

echo ""
echo "✅ Pronto! Agora você pode:"
echo "   1. Fazer login no app com giuseppe.bertholdi@gmail.com"
echo "   2. Acessar /chat?mode=voice"
echo "   3. Testar o chat de voz"
echo ""
echo "🎤 O modo voz agora está disponível no menu /home"

