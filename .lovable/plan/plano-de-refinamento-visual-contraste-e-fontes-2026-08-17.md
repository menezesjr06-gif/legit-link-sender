# Plano de Refinamento Visual: Contraste e Fontes

O objetivo é aprimorar a identidade visual do **MJApp Link Bot**, garantindo que as cores vermelho e preto sejam aplicadas de forma consistente e que elementos importantes tenham fontes em negrito para melhor legibilidade e hierarquia visual.

## Alterações Visuais

### Estilos Globais (`src/styles.css`)
- Ajustar as variáveis OKLCH para garantir que o "Preto" seja profundo e o "Vermelho" tenha contraste suficiente em ambos os modos (Claro e Escuro).
- Garantir que `font-bold` seja aplicado semanticamente em títulos e rótulos importantes.

### Refinamento de Componentes
- **Dashboard (`src/routes/_authenticated.dashboard.tsx`):**
  - Aplicar `font-bold` nos títulos dos cards e nos valores numéricos.
  - Garantir que os ícones usem o vermelho da marca (`text-primary`).
- **Campanhas (`src/routes/_authenticated.campaigns.tsx`):**
  - Negritar os cabeçalhos das tabelas e títulos de seções.
  - Destacar o status das campanhas com fontes mais pesadas.
- **Autenticação (`src/routes/auth.tsx`):**
  - Reforçar o negrito no título do Card e nos botões de ação.

## Detalhes Técnicos
- Utilização de classes utilitárias do Tailwind (`font-bold`, `font-semibold`, `text-primary`).
- Ajuste fino nos tokens de cores em `src/styles.css` para evitar tons acinzentados onde deveria ser preto puro.

## Verificação
- Revisão visual no preview para confirmar se o peso das fontes melhorou a escaneabilidade da página.
- Teste de contraste (Acessibilidade) entre o vermelho (`primary`) e os fundos preto/branco.
