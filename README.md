# Gerenciador de Vencimentos

Aplicação web PWA para gerenciamento de faturas, boletos e cobranças com foco em segurança e usabilidade.

## Funcionalidades

- **Gestão de Faturas** — Cadastro, edição e exclusão de faturas, boletos e cobranças
- **Dashboard Financeiro** — Resumo visual com totais (pendente, pago, vencido)
- **Sistema de Urgência Visual** — Cards com indicadores coloridos por proximidade do vencimento (vermelho, amarelo, verde)
- **Busca e Filtros** — Pesquisa por descrição e filtro por status (todas, pendentes, pagas, vencidas)
- **Notificações** — Alertas via browser notifications para faturas próximas do vencimento
- **Proteção por PIN** — Tela de bloqueio com PIN numérico e auto-lock ao sair do app
- **Criptografia** — Dados financeiros criptografados com AES-256-GCM via Web Crypto API (PBKDF2 para derivação de chave)
- **PWA** — Instalável no dispositivo, funciona offline com Service Worker
- **Tema Claro/Escuro** — Suporte a dark mode
- **Responsivo** — Interface adaptada para desktop e mobile

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Estilização | Tailwind CSS 4, shadcn/ui, Radix UI |
| Roteamento | Wouter |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Persistência | localStorage com criptografia AES-256-GCM |
| PWA | vite-plugin-pwa |
| Backend | Express (serve arquivos estáticos em produção) |
| Package Manager | pnpm |

## Pré-requisitos

- Node.js 18+
- pnpm

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/ValterGoes/Gerenciador_de_Vencimentos.git
cd Gerenciador_de_Vencimentos

# Instalar dependências
pnpm install
```

## Uso

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Executar produção
pnpm start

# Verificação de tipos
pnpm check

# Formatar código
pnpm format
```

## Estrutura do Projeto

```
client/
├── src/
│   ├── components/       # Componentes React (BillCard, BillModal, Dashboard, PinScreen...)
│   ├── contexts/         # AuthContext (PIN), ThemeContext
│   ├── hooks/            # useBills (CRUD + persistência criptografada)
│   ├── lib/              # Utilitários (crypto, secureStorage, notifications, billUtils)
│   └── pages/            # Home, NotFound
server/
└── index.ts              # Express - serve arquivos estáticos
```

## Segurança

- PIN de 4+ dígitos com hash SHA-256
- Dados criptografados com AES-256-GCM
- Derivação de chave via PBKDF2 (100.000 iterações)
- Auto-lock ao minimizar ou trocar de aba
- Nenhum dado financeiro trafega para servidores externos

## Licença

MIT
