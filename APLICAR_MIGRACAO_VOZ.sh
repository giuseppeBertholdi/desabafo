#!/bin/bash

# Script para aplicar migração de sessões de voz no Supabase
# Autor: Sistema Desabafo.io
# Data: Dezembro 2025

echo "🎤 Aplicando Migração de Sessões de Voz..."
echo ""
echo "Este script vai te guiar para aplicar a migração no Supabase."
echo ""

# Verificar se o arquivo de migração existe
if [ ! -f "supabase_migration_voice_sessions.sql" ]; then
    echo "❌ Erro: Arquivo supabase_migration_voice_sessions.sql não encontrado!"
    exit 1
fi

echo "✅ Arquivo de migração encontrado!"
echo ""
echo "📋 INSTRUÇÕES:"
echo ""
echo "1. Acesse: https://app.supabase.com"
echo "2. Selecione seu projeto 'desabafo'"
echo "3. Vá em 'SQL Editor' no menu lateral"
echo "4. Clique em 'New Query'"
echo "5. Cole o conteúdo do arquivo abaixo"
echo "6. Clique em 'Run' para executar"
echo ""
echo "───────────────────────────────────────────────────"
echo ""
cat supabase_migration_voice_sessions.sql
echo ""
echo "───────────────────────────────────────────────────"
echo ""
echo "✅ Migração copiada acima!"
echo ""
echo "Após aplicar a migração, você pode testar:"
echo "  1. Fazer login com conta PRO"
echo "  2. Ir para /chat?mode=voice"
echo "  3. Criar uma nova sessão de voz"
echo ""
echo "📚 Para mais detalhes, veja:"
echo "  - INSTRUCOES_SESSOES_VOZ.md"
echo "  - RESUMO_IMPLEMENTACAO_VOZ.md"
echo ""
echo "🎉 Pronto! Boa sorte!"
