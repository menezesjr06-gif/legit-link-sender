# Plano: Testes Automatizados de RLS

Adicionar uma suite de testes automatizados para validar as políticas de Row Level Security (RLS) e o acesso às rotas sensíveis do MJApp Link Bot para diferentes perfis de usuário (Admin e Owner).

## Objetivos
- Validar que rotas sensíveis (`/settings`, `/campaigns`, `/groups`) exigem autenticação.
- Verificar o isolamento de dados (RLS) para garantir que usuários comuns (Owners) não acessem dados de outros.
- Confirmar que usuários com papel `admin` possuem acesso privilegiado conforme definido nas políticas.

## Etapas de Implementação

### 1. Infraestrutura de Teste
- Criar `src/lib/rls-test.functions.ts` com uma `createServerFn` para testar operações de banco (SELECT, INSERT, UPDATE, DELETE) em tabelas específicas sob o contexto do usuário atual.
- Desenvolver scripts Playwright em `/tmp/browser/rls-tests/` para simular o comportamento do navegador com diferentes sessões.

### 2. Suite de Validação de Acesso
- Criar `rls_suite.py` para:
    - Autenticar com diferentes perfis usando `lovable auth-session`.
    - Tentar acessar rotas protegidas e verificar redirecionamentos.
    - Chamar a função de teste de RLS para validar permissões de tabela.

### 3. Verificação de Políticas
- Testar as tabelas: `groups`, `campaigns`, `campaign_recipients`, `whatsapp_settings`, e `user_roles`.
- Validar que `admin` pode gerenciar `user_roles` e `whatsapp_settings`.
- Validar que `user` (owner) só pode ver/editar seus próprios `groups` e `campaigns`.

## Detalhes Técnicos
- Utilização do Playwright para automação de navegador em ambiente headless.
- Injeção de sessão via `localStorage` e cookies para contornar o SSR e o middleware do TanStack Start.
- Captura de evidências (screenshots e logs de console) para cada cenário de teste.
