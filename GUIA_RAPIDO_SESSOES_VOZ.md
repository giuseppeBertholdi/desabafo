# 🎤 Guia Rápido - Sessões de Voz

## 🚀 Início Rápido (5 minutos)

### Passo 1: Aplicar Migração
```bash
# Execute o script auxiliar
./APLICAR_MIGRACAO_VOZ.sh

# Ou manualmente no Supabase Dashboard:
# 1. Vá em SQL Editor
# 2. Cole o conteúdo de supabase_migration_voice_sessions.sql
# 3. Execute
```

### Passo 2: Testar
```bash
# 1. Faça login com conta PRO
# 2. Acesse: http://localhost:3000/chat?mode=voice
# 3. Clique em "Nova Sessão"
# 4. Fale no microfone
# 5. Veja o timer funcionando!
```

---

## 💡 Como Funciona

### Interface Principal

```
┌─────────────────────────────────────────┐
│  🎤 Sessões de Voz                      │
│                                         │
│  📊 45 de 50 restantes                  │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Sessão Atual        ● REC      │   │
│  │                                 │   │
│  │         5:23                    │   │
│  │  Tempo restante: 4:37           │   │
│  │                                 │   │
│  │  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░            │   │
│  │                                 │   │
│  │  [Finalizar Sessão]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📚 Histórico                           │
│  ├─ 🟢 10:00  09/12 14:30              │
│  ├─ 🟢 8:45   09/12 10:15              │
│  └─ 🟡 3:45   08/12 22:00              │
│       [Continuar →]                    │
└─────────────────────────────────────────┘
```

---

## 🎯 Funcionalidades

### ✅ Criar Nova Sessão
- Clique em **"+ Nova Sessão"**
- Timer inicia automaticamente
- Botão do microfone fica habilitado

### ⏸️ Pausar/Continuar
- Clique no botão do microfone para pausar
- Clique novamente para continuar
- Sessão não é finalizada, apenas pausada

### ✋ Finalizar Sessão
- Clique em **"Finalizar Sessão"**
- Sessão é marcada como completa
- Aparece no histórico com 🟢

### 🔄 Continuar Última Sessão
- Se há sessão não finalizada, botão especial aparece
- Clique em **"↻ Continuar Última Sessão"**
- Timer continua de onde parou

---

## 📊 Limites

| Limite | Valor |
|--------|-------|
| Sessões totais | 50 |
| Duração por sessão | 10 minutos |
| Sessões simultâneas | 1 |
| Plano necessário | PRO |

---

## 🎨 Indicadores Visuais

### Estados das Sessões:
- 🟢 **Verde** = Sessão completada (finalizada)
- 🟡 **Amarelo** = Sessão incompleta (pode continuar)
- 🔴 **Ponto Vermelho** = Gravando agora

### Barras de Progresso:
- **Barra Superior**: Quantas sessões foram usadas (de 50)
- **Barra na Sessão**: Quanto tempo foi usado (de 10 min)

---

## ⚠️ Avisos e Erros

### "Você tem uma sessão não finalizada"
➡️ **Solução**: Finalize ou continue a sessão anterior

### "Limite de 50 sessões atingido"
➡️ **Solução**: Aguarde renovação mensal (futuro) ou upgrade de plano

### "Tempo máximo de 10 minutos atingido"
➡️ **Solução**: Sessão finalizada automaticamente. Crie uma nova.

### "Modo voz disponível apenas no plano PRO"
➡️ **Solução**: Faça upgrade para PRO em /pricing

---

## 🔧 Troubleshooting

### Timer não está contando
1. Verifique se criou uma sessão primeiro
2. Verifique console do navegador por erros
3. Recarregue a página

### Histórico não carrega
1. Verifique conexão com internet
2. Verifique se migração foi aplicada
3. Veja console do navegador

### Botão do microfone desabilitado
1. Verifique se tem sessão ativa
2. Verifique permissões do microfone
3. Verifique se é usuário PRO

---

## 📱 Atalhos

| Ação | Desktop | Mobile |
|------|---------|--------|
| Ver histórico | Clique no ⏰ | Clique no ⏰ |
| Nova sessão | Botão verde | Botão verde |
| Pausar | Clique no 🎤 | Clique no 🎤 |
| Finalizar | Botão vermelho | Botão vermelho |

---

## 🎓 Dicas

### 💡 Dica 1: Planeje suas sessões
Você tem 50 sessões de 10 minutos = **500 minutos totais** (8h 20min)

### 💡 Dica 2: Use pausas estratégicas
Pause quando precisar pensar. Não gaste tempo à toa.

### 💡 Dica 3: Finalize quando terminar
Não deixe sessões abertas. Finalize para liberar nova sessão.

### 💡 Dica 4: Veja o histórico
Acompanhe quanto você já usou e planeje melhor.

---

## 📞 Suporte

### Problemas?
1. Leia `INSTRUCOES_SESSOES_VOZ.md` (detalhado)
2. Leia `RESUMO_IMPLEMENTACAO_VOZ.md` (técnico)
3. Verifique console do navegador
4. Entre em contato com suporte

---

## ✨ Aproveite!

Agora você tem **50 sessões de voz** para desabafar quando quiser!

**Lembre-se**: 
- 🎤 Cada sessão = 10 minutos
- 🔄 Pode continuar sessões não finalizadas
- 📊 Acompanhe seu histórico
- ⏱️ Timer mostra tempo restante

**Bom desabafo! 💜**

