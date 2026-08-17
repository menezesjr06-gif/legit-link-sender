# Plano de Alteração Visual: Tema e Logomarca

O objetivo é atualizar a identidade visual do **MJApp Link Bot** para uma paleta de cores baseada em vermelho e preto, além de adicionar um placeholder para a logomarca no cabeçalho do sidebar.

## Alterações Visuais

### Cores e Tema
- Atualizar `src/styles.css` para redefinir as cores semânticas utilizando OKLCH.
- **Modo Claro:**
  - Fundo: Branco ou cinza muito claro.
  - Primário (Vermelho): `oklch(0.6 0.25 25)` (um vermelho vibrante).
  - Texto/Sidebar (Preto): `oklch(0.15 0.02 250)`.
- **Modo Escuro:**
  - Fundo: Preto profundo `oklch(0.1 0.01 250)`.
  - Primário (Vermelho): `oklch(0.55 0.25 25)`.
  - Card/Sidebar: Preto ligeiramente mais claro.

### Logomarca
- No arquivo `src/routes/_authenticated/route.tsx`, substituir o texto "MJApp Bot" por um componente que inclua um ícone (Bot) estilizado em vermelho e o nome da marca.
- Adicionar um placeholder de imagem no `SidebarHeader` caso o usuário deseje substituir por um arquivo real futuramente.

## Detalhes Técnicos
- Modificação das variáveis CSS no bloco `@theme inline`, `:root` e `.dark` em `src/styles.css`.
- Ajuste no componente `SidebarHeader` em `src/routes/_authenticated/route.tsx` para usar o novo esquema de cores e layout da logomarca.

## Verificação
- Verificar se o contraste entre o texto branco/cinza e o fundo vermelho/preto está acessível.
- Garantir que o modo escuro mantém a legibilidade.
