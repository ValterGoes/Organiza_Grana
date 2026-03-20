# Ideias de Design - Organiza Grana

## Resposta 1: Minimalismo Funcional com Urgência Visual (Probabilidade: 0.08)

**Design Movement:** Brutalist Minimalism com foco em Affordances Claras

**Core Principles:**
- Hierarquia rigorosa através de tipografia e espaçamento
- Cores como linguagem de comunicação (não decoração)
- Interfaces sem distrações, apenas o essencial
- Feedback imediato e visual para ações críticas

**Color Philosophy:**
- Fundo neutro (off-white/cinza claro) para máxima legibilidade
- Vermelho vibrante (#EF4444) para vencido/crítico
- Amarelo quente (#FBBF24) para próximo do vencimento (7-14 dias)
- Verde suave (#10B981) para em dia
- Azul neutro (#3B82F6) para informações
- Cinza escuro (#1F2937) para textos principais

**Layout Paradigm:**
- Dashboard em 2 colunas: lista de contas à esquerda, detalhes/ações à direita
- Cards com borda esquerda colorida (indicador de urgência)
- Sem rounded corners excessivos, apenas 4px
- Uso de linhas divisórias sutis para separação

**Signature Elements:**
- Indicador de urgência em forma de barra vertical colorida (4px) no lado esquerdo de cada card
- Badges de status com ícones minimalistas (relógio, check, alerta)
- Timeline visual mostrando dias até vencimento

**Interaction Philosophy:**
- Hover states com mudança de background sutil (não cores vibrantes)
- Transições rápidas (150ms) para feedback imediato
- Modais para cadastro/edição, não inline editing
- Confirmação visual com toast notifications

**Animation:**
- Entrada suave de cards (fade-in 200ms)
- Pulse sutil em itens vencidos (1s loop)
- Transições de cor em hover (150ms ease-in-out)
- Slide-in de notificações do canto superior direito

**Typography System:**
- Headings: Poppins Bold (700) para títulos principais
- Body: Inter Regular (400) para conteúdo
- Labels: Inter Medium (500) para campos e badges
- Tamanhos: 32px (h1), 24px (h2), 16px (body), 14px (small)

---

## Resposta 2: Design System Moderno com Glassmorphism (Probabilidade: 0.07)

**Design Movement:** Contemporary Digital Minimalism com influências de Glassmorphism

**Core Principles:**
- Transparência e profundidade através de camadas
- Micro-interações suaves e elegantes
- Gradientes sutis para criar dimensão
- Espaçamento generoso para respiração visual

**Color Philosophy:**
- Gradiente de fundo: azul claro a roxo suave
- Cards com fundo semi-transparente (backdrop-blur)
- Vermelho coral (#FF6B6B) para vencido
- Âmbar (#FFA94D) para próximo do vencimento
- Verde menta (#51CF66) para em dia
- Branco com opacidade para cards

**Layout Paradigm:**
- Grid assimétrico: dashboard com cards flutuantes
- Sidebar colapsável com navegação
- Cards com sombras suaves e blur effects
- Uso de espaçamento irregular para dinamismo

**Signature Elements:**
- Cards com efeito de vidro (glassmorphism)
- Ícones com gradientes internos
- Badges com fundo semi-transparente
- Linhas decorativas suaves entre seções

**Interaction Philosophy:**
- Hover com elevação (shadow increase) e blur intensificado
- Cliques com ripple effect suave
- Transições fluidas entre estados
- Animações de entrada em cascata

**Animation:**
- Entrada de cards em cascata (staggered 100ms)
- Hover com scale 1.02 e shadow intensificado
- Pulse suave em cards críticos (2s loop)
- Transições de cor em 200ms ease-out

**Typography System:**
- Headings: Outfit Bold (700) para títulos
- Body: Poppins Regular (400) para conteúdo
- Labels: Poppins Medium (500) para campos
- Tamanhos: 36px (h1), 28px (h2), 16px (body), 13px (small)

---

## Resposta 3: Design Utilitário com Foco em Dados (Probabilidade: 0.06)

**Design Movement:** Information Design com influências de Dashboard Moderno

**Core Principles:**
- Dados como protagonista, não interface
- Visualização clara de padrões e tendências
- Componentes reutilizáveis e previsíveis
- Densidade informacional otimizada

**Color Philosophy:**
- Fundo escuro (charcoal #1A1A1A) para reduzir fadiga ocular
- Vermelho brilhante (#FF4757) para vencido
- Laranja (#FFA502) para próximo do vencimento
- Verde claro (#2ED573) para em dia
- Azul claro (#0984E3) para informações
- Cinza claro (#ECEFF1) para textos

**Layout Paradigm:**
- Dashboard em grid 3 colunas: resumo, lista, detalhes
- Tabela como elemento principal com sorting/filtering
- Gráficos de tendência de vencimentos
- Sem muitos espaços em branco, informação densa

**Signature Elements:**
- Indicadores numéricos grandes para totais
- Gráficos de barras mostrando distribuição de vencimentos
- Tabela com linhas alternadas (zebra striping)
- Badges com números de dias até vencimento

**Interaction Philosophy:**
- Cliques em linhas da tabela para expandir detalhes
- Filtros e sorting interativos
- Seleção múltipla com checkboxes
- Ações em batch (marcar como pago, deletar, etc.)

**Animation:**
- Transições de cor em 100ms
- Expansão de linhas em 200ms ease-out
- Fade-in de gráficos em 300ms
- Pulse muito sutil em números críticos (3s loop)

**Typography System:**
- Headings: IBM Plex Mono Bold (700) para títulos
- Body: IBM Plex Mono Regular (400) para conteúdo
- Labels: IBM Plex Mono Medium (500) para campos
- Tamanhos: 28px (h1), 20px (h2), 14px (body), 12px (small)

---

## Design Escolhido: Minimalismo Funcional com Urgência Visual

Escolhi a **Resposta 1** por ser a mais adequada para um aplicativo de gerenciamento de vencimentos. A clareza visual através de cores, a ausência de distrações e o feedback imediato são essenciais para uma ferramenta que precisa comunicar urgência de forma rápida e intuitiva.

### Implementação:
- Tipografia: Poppins para títulos, Inter para corpo
- Cores de urgência bem definidas: Vermelho (#EF4444), Amarelo (#FBBF24), Verde (#10B981)
- Layout limpo com cards que têm barra lateral colorida
- Transições suaves mas rápidas (150ms)
- Sem rounded corners excessivos (máximo 8px)
- Feedback visual através de badges e indicadores
