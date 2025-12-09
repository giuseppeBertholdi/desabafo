# ✅ Checklist de Deploy - Sessões de Voz

## 📋 Pré-Deploy

### 1. Verificar Arquivos
- [x] `supabase_migration_voice_sessions.sql` criado
- [x] `app/api/voice/sessions/route.ts` criado
- [x] `components/VoiceSessionManager.tsx` criado
- [x] `app/chat/ChatClient.tsx` modificado
- [x] Documentação criada

### 2. Testes Locais
- [ ] Servidor rodando sem erros
- [ ] Nenhum erro de lint
- [ ] TypeScript compilando sem erros
- [ ] Console do navegador sem erros

---

## 🗄️ Banco de Dados

### 1. Aplicar Migração
- [ ] Acessar Supabase Dashboard
- [ ] Ir em SQL Editor
- [ ] Executar `supabase_migration_voice_sessions.sql`
- [ ] Verificar que tabela `voice_sessions` foi criada
- [ ] Verificar que funções foram criadas:
  - [ ] `count_user_voice_sessions()`
  - [ ] `get_last_incomplete_voice_session()`

### 2. Verificar RLS
- [ ] RLS está habilitado na tabela `voice_sessions`
- [ ] Políticas de SELECT criadas
- [ ] Políticas de INSERT criadas
- [ ] Políticas de UPDATE criadas
- [ ] Políticas de DELETE criadas

### 3. Testar Queries
```sql
-- Testar contagem de sessões
SELECT count_user_voice_sessions('USER_ID_AQUI');

-- Testar busca de sessão incompleta
SELECT get_last_incomplete_voice_session('USER_ID_AQUI');

-- Verificar RLS
SELECT * FROM voice_sessions; -- Deve retornar apenas suas sessões
```

---

## 🚀 Deploy do Código

### 1. Commit e Push
```bash
git add .
git commit -m "feat: Implementa sistema de sessões de voz para plano PRO"
git push origin main
```

### 2. Verificar Build
- [ ] Build passa sem erros
- [ ] Nenhum warning crítico
- [ ] Deploy automático funcionou (Netlify/Vercel)

### 3. Verificar Produção
- [ ] Site está no ar
- [ ] Nenhum erro 500
- [ ] Console do navegador limpo

---

## 🧪 Testes em Produção

### 1. Teste Básico (Usuário PRO)
- [ ] Login com conta PRO
- [ ] Acessar `/chat?mode=voice`
- [ ] Ver componente VoiceSessionManager
- [ ] Ver "50 de 50 restantes"
- [ ] Botão "Nova Sessão" habilitado

### 2. Criar Sessão
- [ ] Clicar em "Nova Sessão"
- [ ] Sessão criada com sucesso
- [ ] Timer iniciou (0:00, 0:01, 0:02...)
- [ ] Barra de progresso apareceu
- [ ] Botão do microfone habilitado
- [ ] Contador mudou para "49 de 50 restantes"

### 3. Gravar Áudio
- [ ] Clicar no botão do microfone
- [ ] Permissão do microfone solicitada
- [ ] Ponto vermelho pulsante apareceu
- [ ] "Estou ouvindo..." apareceu
- [ ] Falar algo
- [ ] IA responde

### 4. Pausar/Continuar
- [ ] Clicar no microfone novamente
- [ ] Gravação pausou
- [ ] Timer continua contando
- [ ] Clicar novamente
- [ ] Gravação retomou

### 5. Finalizar Sessão
- [ ] Clicar em "Finalizar Sessão"
- [ ] Sessão finalizada com sucesso
- [ ] Timer parou
- [ ] Sessão apareceu no histórico com 🟢
- [ ] Botão "Nova Sessão" habilitado novamente

### 6. Histórico
- [ ] Clicar no ícone de relógio (⏰)
- [ ] Histórico abriu
- [ ] Sessão anterior aparece
- [ ] Data e hora corretas
- [ ] Duração correta

### 7. Continuar Sessão
- [ ] Criar nova sessão
- [ ] Gravar por alguns segundos
- [ ] NÃO finalizar
- [ ] Recarregar página
- [ ] Botão "↻ Continuar Última Sessão" aparece
- [ ] Clicar nele
- [ ] Timer continua de onde parou

### 8. Limite de Tempo
- [ ] Criar nova sessão
- [ ] Deixar chegar em 10:00
- [ ] Sessão finaliza automaticamente
- [ ] Mensagem de aviso aparece
- [ ] Sessão marcada como completa

### 9. Limite de Sessões
⚠️ **Teste Opcional** (requer 50 sessões)
- [ ] Criar 50 sessões
- [ ] Tentar criar a 51ª
- [ ] Erro "Limite atingido" aparece
- [ ] Botão fica desabilitado

---

## 🔒 Segurança

### 1. Verificar RLS
- [ ] Usuário A não vê sessões do usuário B
- [ ] Usuário A não pode editar sessões do usuário B
- [ ] Usuário FREE não pode criar sessões
- [ ] Requisições sem auth retornam 401

### 2. Validações
- [ ] Não pode criar sessão sem ser PRO
- [ ] Não pode criar se já tem incompleta
- [ ] Não pode ultrapassar 10 minutos
- [ ] Não pode criar mais de 50 sessões

---

## 📊 Monitoramento

### 1. Logs
- [ ] Verificar logs do servidor
- [ ] Nenhum erro crítico
- [ ] Queries SQL otimizadas
- [ ] Tempo de resposta < 500ms

### 2. Métricas
- [ ] Quantas sessões foram criadas hoje
- [ ] Duração média das sessões
- [ ] Taxa de conclusão (finalizadas vs abandonadas)
- [ ] Quantos usuários atingiram o limite

### 3. Erros
- [ ] Configurar alertas para erros 500
- [ ] Configurar alertas para limite atingido
- [ ] Monitorar uso do banco de dados

---

## 📱 Responsividade

### 1. Desktop (>1024px)
- [ ] Sidebar lateral aparece
- [ ] Layout em 2 colunas funciona
- [ ] Timer visível
- [ ] Histórico acessível

### 2. Tablet (768px - 1024px)
- [ ] Layout se adapta
- [ ] Componente no topo
- [ ] Tudo acessível

### 3. Mobile (<768px)
- [ ] Componente no topo funciona
- [ ] Timer legível
- [ ] Botões clicáveis
- [ ] Histórico expansível

---

## 🌐 Navegadores

### 1. Chrome/Edge
- [ ] Funciona perfeitamente
- [ ] Microfone funciona
- [ ] Timer preciso

### 2. Firefox
- [ ] Funciona perfeitamente
- [ ] Microfone funciona
- [ ] Timer preciso

### 3. Safari
- [ ] Funciona perfeitamente
- [ ] Microfone funciona
- [ ] Timer preciso

---

## 📚 Documentação

### 1. Usuário Final
- [ ] Guia rápido disponível
- [ ] FAQ atualizado
- [ ] Tutorial em vídeo (opcional)

### 2. Desenvolvedores
- [ ] README atualizado
- [ ] Instruções de deploy
- [ ] Comentários no código

### 3. Suporte
- [ ] Troubleshooting documentado
- [ ] Casos de erro conhecidos
- [ ] Contato de suporte

---

## ✅ Finalização

### 1. Comunicação
- [ ] Avisar equipe sobre nova feature
- [ ] Avisar usuários PRO por email
- [ ] Postar nas redes sociais
- [ ] Atualizar página de pricing

### 2. Backup
- [ ] Backup do banco antes do deploy
- [ ] Backup do código anterior
- [ ] Plano de rollback pronto

### 3. Monitoramento Pós-Deploy
- [ ] Monitorar por 24h
- [ ] Responder feedback de usuários
- [ ] Corrigir bugs críticos imediatamente

---

## 🎉 Deploy Completo!

Parabéns! O sistema de sessões de voz está no ar! 🚀

### Próximos Passos:
1. ✅ Monitorar uso
2. ✅ Coletar feedback
3. ✅ Implementar melhorias
4. ✅ Adicionar analytics

---

**Data do Deploy**: _____________
**Responsável**: _____________
**Versão**: 1.0.0
**Status**: ⬜ Pendente | ⬜ Em Andamento | ⬜ Completo

