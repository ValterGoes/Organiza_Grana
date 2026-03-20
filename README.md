# Organiza Grana

Aplicação web PWA para controle de contas e gastos pessoais com foco em segurança e usabilidade.

## Funcionalidades

### Vencimentos
- **Gestão de Faturas** — Cadastro, edição e exclusão de faturas, boletos e cobranças
- **Faturas Recorrentes** — Boletos com valor fixo que avançam automaticamente a data de vencimento após pagamento (ex: aluguel, internet, streaming)
- **Projeção de Parcelas** — Parcelas futuras de faturas recorrentes são projetadas automaticamente nos meses correspondentes com badge "Futura", exibindo corretamente o número da parcela
- **Navegação por Mês** — Seletor de mês no dashboard para visualizar faturas e parcelas projetadas de qualquer período
- **Dashboard Financeiro** — Resumo visual com totais do mês (total, pendente, pago) e alerta global de faturas vencidas com lista colapsável
- **Sistema de Urgência Visual** — Cards com indicadores coloridos por proximidade do vencimento (vermelho, amarelo, verde)
- **Filtros** — Filtro por status (todas, pendentes, pagas, vencidas)
- **Notificações** — Alertas via browser notifications para faturas próximas do vencimento

### Gastos Diários
- **Registro Rápido** — Adicione gastos do dia com descrição e valor em um toque
- **Resumo por Período** — Totais de hoje, ontem e do mês corrente
- **Histórico Mensal** — Visualização dos gastos agrupados por dia com totais diários
- **Exclusão Rápida** — Remova gastos com um clique

### Geral
- **Identidade Visual** — Paleta verde (#3BA36C) e laranja (#F79030), headers com gradiente e logo personalizada
- **Navegação por Abas** — Bottom navigation para alternar entre Vencimentos e Gastos Diários
- **Proteção por PIN** — Tela de bloqueio com PIN numérico, logo e auto-lock ao sair do app
- **Criptografia** — Dados financeiros criptografados com AES-256-GCM via Web Crypto API (PBKDF2 para derivação de chave)
- **Backup e Restauração** — Backup automático a cada 7 dias (download JSON) e restauração manual na tela de setup do PIN
- **Armazenamento Persistente** — Solicita ao navegador que preserve os dados do app contra limpeza automática
- **PWA** — Instalável no dispositivo, funciona offline com Service Worker
- **Tema Claro/Escuro** — Suporte a dark mode com cores da marca adaptadas
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
git clone https://github.com/ValterGoes/Organiza_Grana.git
cd Organiza_Grana

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
│   ├── hooks/            # useBills, useExpenses (CRUD + persistência criptografada)
│   ├── lib/              # Utilitários (crypto, secureStorage, notifications, billUtils, backup)
│   └── pages/            # Home, Expenses, NotFound
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
