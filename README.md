# MJApp Bot Link

Crie um aplicativo web/mobile moderno chamado MJApp Link Bot, destinado ao gerenciamento e envio automatizado de links para grupos do WhatsApp, utilizando integração oficial da Meta/WhatsApp Business Platform, evitando automação não autorizada de contas pessoais.




Funcionalidades principais




1. Painel administrativo




- Login seguro de administrador.

- Dashboard com quantidade de campanhas, mensagens enviadas, pendentes e falhas.

- Histórico de todos os disparos.

- Indicadores de desempenho.




2. Cadastro de grupos e destinatários




- Cadastrar grupos/listas autorizadas.

- Nome do grupo.

- Identificação/ID da lista.

- Status: ativo ou pausado.

- Permitir organizar grupos por categorias.




3. Criador de campanhas




- Campo para inserir o link.

- Campo para título da campanha.

- Campo para escrever a mensagem.

- Possibilidade de adicionar emojis.

- Pré-visualização da mensagem antes do envio.

- Botão Enviar agora.

- Opção de Agendar envio para data e horário específicos.




4. Automação




- Permitir criar campanhas recorrentes.

- Configurar intervalo entre envios conforme os limites permitidos pela API oficial.

- Pausar, continuar ou cancelar campanhas.

- Fila de mensagens para evitar sobrecarga.

- Sistema de retry para falhas temporárias.




5. Proteção contra spam




- Enviar somente para contatos/grupos que tenham autorizado o recebimento.

- Respeitar políticas e limites da WhatsApp Business Platform.

- Sistema de opt-out/descadastro.

- Limite diário e controle de frequência.

- Bloqueio automático de campanhas que possam gerar comportamento abusivo.

- Não utilizar técnicas para burlar bloqueios, CAPTCHA, limites ou mecanismos anti-spam do WhatsApp.




6. Histórico




- Mostrar cada campanha enviada.

- Data e horário.

- Grupo/lista destinatária.

- Status: enviado, pendente, erro ou cancelado.

- Registro dos erros da API.




7. Interface

   Criar uma interface profissional, responsiva e intuitiva, com:




- Dashboard.

- Menu lateral.

- Campanhas.

- Grupos/Listas.

- Agendamentos.

- Histórico.

- Configurações.

- Usuários.

- Sistema de notificações.




Tecnologia sugerida




Frontend moderno e responsivo, backend com API REST, banco de dados para usuários, campanhas, grupos e histórico, autenticação segura e integração com a WhatsApp Business Platform Cloud API.




O sistema deve utilizar variáveis de ambiente para tokens e credenciais, nunca expondo informações sensíveis no frontend.




Fluxo principal




Login → Dashboard → Cadastrar lista autorizada → Criar campanha → Inserir mensagem + link → Selecionar destinatários → Escolher enviar agora ou agendar → Validar campanha → Colocar na fila → Enviar pela API oficial → Registrar resultado → Exibir relatório.




O aplicativo deve ter arquitetura preparada para crescimento, código organizado, tratamento de erros, logs, segurança, controle de permissões e possibilidade de futuramente adicionar múltiplos usuários e múltiplos números oficiais do WhatsApp.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8e03ad1e-0b11-4081-a35d-3f3925029ba5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
