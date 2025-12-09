# Dashboard Administrativo - Configuração

## Visão Geral

Foi criado um dashboard administrativo completo para visualizar todos os dados do Supabase de forma organizada e bonita.

## Estrutura

### Rotas Criadas

1. **`/admin/login`** - Página de login do administrador
2. **`/admin/dashboard`** - Dashboard principal com todas as estatísticas

### APIs Criadas

1. **`/api/admin/auth`** - Autenticação do admin (POST, GET, DELETE)
2. **`/api/admin/stats`** - Estatísticas gerais do sistema
3. **`/api/admin/users`** - Lista de usuários com paginação

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no Netlify (ou `.env.local`):

```env
# Credenciais do Admin (ALTERE PARA VALORES SEGUROS!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@Desabafo2024!Secure#

# Já deve existir:
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

**⚠️ IMPORTANTE:** Altere as credenciais padrão para valores seguros e complexos!

### Credenciais Padrão

- **Usuário:** `admin`
- **Senha:** `Admin@Desabafo2024!Secure#`

**⚠️ Mude essas credenciais imediatamente em produção!**

## Funcionalidades

### Visão Geral

- **Total de Usuários** - Contagem de usuários únicos
- **Sessões de Chat** - Total de sessões criadas
- **Mensagens Enviadas** - Total de mensagens enviadas
- **Minutos de Voz** - Total de minutos de voz usados
- **Assinaturas Ativas** - Usuários com planos pagos
- **Mensagens Totais** - Total de mensagens no sistema

### Distribuição de Planos

- Free
- Essential
- Pro

### Uso Mensal

Gráfico mostrando o uso de mensagens e voz nos últimos 6 meses.

### Lista de Usuários

Tabela completa com:
- Nome/Email
- User ID
- Plano atual
- Número de sessões
- Total de mensagens
- Mensagens deste mês
- Minutos de voz usados
- Data de criação

## Segurança

1. **Autenticação por Cookie** - Sessão armazenada em cookie httpOnly
2. **Verificação em Todas as Rotas** - Todas as APIs verificam autenticação
3. **Service Role Key** - Usa SUPABASE_SERVICE_ROLE_KEY para bypassar RLS
4. **Senha Forte** - Configure uma senha complexa em produção

## Acesso

1. Acesse `/admin/login`
2. Digite as credenciais
3. Você será redirecionado para `/admin/dashboard`

## Proteção

O dashboard está protegido por:
- Middleware de autenticação
- Verificação de cookie de sessão
- Redirecionamento automático se não autenticado

## Próximos Passos

1. **Altere as credenciais padrão** para valores seguros
2. **Configure as variáveis de ambiente** no Netlify
3. **Teste o acesso** ao dashboard
4. **Adicione mais funcionalidades** conforme necessário (exportar dados, ações administrativas, etc.)

