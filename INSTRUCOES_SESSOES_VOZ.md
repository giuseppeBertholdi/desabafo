# Sistema de Sessões de Voz - Instruções de Implementação

## Visão Geral

Este documento descreve a implementação do sistema de sessões de voz para o plano PRO, que permite aos usuários:
- 50 sessões de 10 minutos cada
- Continuar a última sessão não finalizada
- Ver histórico de sessões
- Timer visual mostrando tempo restante

## 1. Aplicar Migração do Banco de Dados

Execute o script SQL no Supabase:

```bash
# No dashboard do Supabase, vá em SQL Editor e execute:
cat supabase_migration_voice_sessions.sql
```

Ou manualmente via Supabase Dashboard:
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `supabase_migration_voice_sessions.sql`
4. Execute o script

### O que a migração cria:

- **Tabela `voice_sessions`**: Armazena informações sobre cada sessão de voz
  - `id`: ID único da sessão
  - `user_id`: Referência ao usuário
  - `duration_seconds`: Duração em segundos (máx 600 = 10 min)
  - `is_completed`: Se a sessão foi finalizada
  - `transcript`: Transcrição da conversa (opcional)
  - `summary`: Resumo gerado pela IA (opcional)
  - `started_at`, `ended_at`: Timestamps
  
- **Funções auxiliares**:
  - `count_user_voice_sessions()`: Conta sessões completadas
  - `get_last_incomplete_voice_session()`: Retorna última sessão não finalizada

- **RLS (Row Level Security)**: Políticas de segurança para acesso aos dados

## 2. Estrutura dos Arquivos Criados

### API Route
- `app/api/voice/sessions/route.ts`: Endpoints para gerenciar sessões
  - `GET`: Lista todas as sessões do usuário
  - `POST`: Cria nova sessão
  - `PUT`: Atualiza sessão (duração, finalizar)

### Componente UI
- `components/VoiceSessionManager.tsx`: Interface de gerenciamento
  - Exibe sessões restantes
  - Timer da sessão atual
  - Histórico de sessões
  - Botões para criar/continuar/finalizar sessões

### Integração
- `app/chat/ChatClient.tsx`: Integrado com o modo voz existente

## 3. Como Funciona

### Fluxo de Uso

1. **Criar Nova Sessão**:
   - Usuário clica em "Nova Sessão" no VoiceSessionManager
   - API verifica se há sessões disponíveis (máx 50)
   - API verifica se não há sessão incompleta
   - Cria nova sessão no banco
   - Inicia timer local
   - Habilita botão de microfone

2. **Durante a Sessão**:
   - Timer conta os segundos
   - A cada 5 segundos, atualiza a duração no banco
   - Quando atinge 10 minutos (600s), finaliza automaticamente
   - Barra de progresso mostra percentual do tempo usado

3. **Continuar Sessão**:
   - Se existe sessão não finalizada, botão especial aparece
   - Clique retoma a sessão do ponto onde parou
   - Timer continua de onde parou

4. **Finalizar Sessão**:
   - Usuário clica em "Finalizar Sessão"
   - Marca `is_completed = true` no banco
   - Define `ended_at` com timestamp atual
   - Libera para criar nova sessão

### Histórico

- Exibe todas as sessões passadas
- Código de cor:
  - 🟢 Verde: Sessão completada
  - 🟡 Amarelo: Sessão não finalizada
- Mostra duração e data de cada sessão
- Permite continuar sessões incompletas

## 4. Limitações e Validações

### No Backend (API):
- ✅ Máximo 50 sessões por usuário
- ✅ Máximo 10 minutos (600 segundos) por sessão
- ✅ Apenas usuários PRO podem criar sessões
- ✅ Não permite criar nova sessão se há uma incompleta
- ✅ RLS garante que usuário só acessa suas próprias sessões

### No Frontend:
- ✅ Timer visual mostra tempo restante
- ✅ Barra de progresso indica uso do tempo
- ✅ Finaliza automaticamente ao atingir 10 minutos
- ✅ Botão desabilitado quando limite atingido
- ✅ Atualização em tempo real do histórico

## 5. Melhorias Futuras (Opcional)

### Possíveis Extensões:
1. **Transcrição automática**: Salvar transcrição da conversa
2. **Resumo com IA**: Gerar resumo automático ao finalizar
3. **Análise de sentimentos**: Detectar emoções durante a sessão
4. **Export**: Permitir exportar histórico em PDF/JSON
5. **Notificações**: Avisar quando faltam 2 minutos para acabar
6. **Renovação de pacote**: Comprar mais 50 sessões

### Integração com Insights:
- Adicionar dados das sessões de voz nos insights do usuário
- Gráficos de uso ao longo do tempo
- Padrões de horários de uso

## 6. Testes

### Testar Manualmente:
1. ✅ Fazer login com conta PRO
2. ✅ Ir para /chat?mode=voice
3. ✅ Criar nova sessão
4. ✅ Verificar que timer está funcionando
5. ✅ Pausar e continuar gravação
6. ✅ Finalizar sessão
7. ✅ Ver histórico
8. ✅ Continuar sessão não finalizada
9. ✅ Tentar criar quando no limite (após 50 sessões)
10. ✅ Verificar que finaliza aos 10 minutos

### Casos de Erro:
- ⚠️ Tentar criar sessão sem ser PRO → Erro 403
- ⚠️ Tentar criar quando já tem incompleta → Erro 400
- ⚠️ Tentar criar após 50 sessões → Erro 429
- ⚠️ Tentar atualizar sessão de outro usuário → Erro 404

## 7. Monitoramento

### Métricas Importantes:
- Número médio de sessões por usuário
- Duração média das sessões
- Taxa de conclusão (finaliza vs abandona)
- Horários de pico de uso

### Logs:
- Erros ao criar/atualizar sessões
- Sessões que atingem limite de tempo
- Usuários que atingem limite de 50 sessões

## 8. Suporte

### Perguntas Frequentes:

**P: O que acontece se eu fechar o navegador durante uma sessão?**
R: A sessão fica marcada como incompleta. Você pode continuar de onde parou na próxima vez.

**P: Posso ter múltiplas sessões abertas?**
R: Não. Você precisa finalizar a sessão atual antes de criar uma nova.

**P: O que acontece quando acabo as 50 sessões?**
R: Você não poderá criar novas sessões até o próximo período de renovação (implementar lógica de renovação mensal).

**P: A transcrição é salva?**
R: Atualmente não. A estrutura está preparada, mas por privacidade, não está ativado.

## 9. Configurações Recomendadas

### Variáveis de Ambiente:
Nenhuma nova variável necessária. Usa as existentes do Supabase.

### Performance:
- As queries são otimizadas com índices
- RLS garante segurança sem impacto significativo
- Atualização a cada 5s evita sobrecarga no banco

### Escalabilidade:
- Tabela suporta milhões de registros
- Índices garantem queries rápidas
- RLS nativo do Supabase é eficiente

## 10. Troubleshooting

### Problema: Sessão não está sendo criada
- Verificar se usuário é PRO
- Verificar se já não existe sessão incompleta
- Verificar limite de 50 sessões
- Ver logs no console do navegador

### Problema: Timer não está funcionando
- Verificar se setInterval está sendo limpo corretamente
- Ver se voiceSessionId está definido
- Verificar logs de atualização no console

### Problema: Histórico não carrega
- Verificar conexão com Supabase
- Verificar RLS policies
- Ver network tab para erros de API

---

**Última Atualização**: Dezembro 2025
**Versão**: 1.0.0
**Autor**: Sistema Desabafo.io

