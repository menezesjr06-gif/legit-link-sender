# Plano de Implementação - Integração WhatsApp e Configurações

O usuário deseja saber como acessar (login) e integrar o MJApp Link Bot. Atualmente, o sistema possui uma tela de login funcional em `/auth`, mas a página de configurações e a integração real com a API do WhatsApp Business ainda não foram implementadas. Este plano visa criar a interface de configurações para que o usuário possa inserir suas credenciais da Meta/WhatsApp e a lógica de backend para validar essa integração.

## 1. Interface de Configurações
- Criar a rota `src/routes/_authenticated.settings.tsx` para gerenciar as credenciais da API do WhatsApp Business.
- Implementar um formulário para:
    - WhatsApp Business ID
    - Access Token (Token de Acesso Permanente)
    - Phone Number ID
    - Verify Token (para Webhooks)

## 2. Banco de Dados e Lógica de Servidor
- A tabela `whatsapp_settings` já existe no banco de dados (criada em migrações anteriores).
- Criar `src/lib/whatsapp.functions.ts` com funções de servidor para:
    - Salvar/Atualizar configurações do WhatsApp.
    - Testar a conexão com a API do WhatsApp enviando uma mensagem de teste.
- Criar `src/lib/whatsapp.server.ts` para encapsular a lógica de chamada direta à API da Meta (usando `fetch`).

## 3. Navegação e Acesso
- Atualizar o sidebar em `src/routes/_authenticated/route.tsx` para apontar corretamente para a rota `/settings`.
- Garantir que apenas usuários autenticados acessem a área de integração.

## Detalhes Técnicos
- **Frontend**: Shadcn UI (`Card`, `Input`, `Form`, `Button`) para o formulário de configuração.
- **Server Functions**: Uso de `createServerFn` para persistir dados sensíveis no backend (armazenados na tabela `whatsapp_settings`).
- **Segurança**: As credenciais serão protegidas por RLS na tabela `whatsapp_settings`, vinculadas ao `user_id` ou perfil administrativo.
- **WhatsApp API**: Integração com a `graph.facebook.com/v20.0/`.
