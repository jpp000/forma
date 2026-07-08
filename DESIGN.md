# Forma — Design System

> Forma × Apple Fitness. Instrumento de saúde premium: preciso, calmo, confiante.
> Mobile (Expo) é a referência; portal web herda tokens com densidade Linear/Cal.

## Visual Theme & Atmosphere

- **Mood:** saúde de precisão — métricas claras, hierarquia forte, sem ruído decorativo
- **Density:** balanceada — home com resumo + atalhos, nunca dashboard denso tipo WHOOP
- **Theme:** seguir sistema (light + dark desde o dia 1)
- **Motion:** micro-animações em anéis e streak; haptics em ações de log (treino/refeição)
- **Logo:** wordmark "Forma" até logo final existir

## Color Palette & Roles

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `bg` | `#FFFFFF` | `#000000` | Canvas principal |
| `surface` | `#F5F5F7` | `#1C1C1E` | Cards, sheets, tab bar |
| `surfaceElevated` | `#FFFFFF` | `#2C2C2E` | Cards elevados no escuro |
| `ink` | `#1D1D1F` | `#F5F5F7` | Texto primário |
| `inkSecondary` | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | Labels, metadados |
| `inkTertiary` | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | Hints, chevrons |
| `separator` | `rgba(60,60,67,0.12)` | `rgba(84,84,88,0.65)` | Divisores em grouped lists |
| `primary` | `#30D158` | `#30D158` | Marca, CTAs, tab ativa, guidance, streak |
| `training` | `#FFD60A` | `#FFD60A` | Treino, energia, anel Move |
| `nutrition` | `#FF9F0A` | `#FF9F0A` | Nutrição, refeições, macros |
| `progress` | `#64D2FF` | `#64D2FF` | Peso, gráficos, evolução |
| `error` | `#FF453A` | `#FF453A` | Erros, alertas críticos |
| `border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.1)` | Divisores sutis |

**Estratégia de cor:** uma cor de marca (`primary` verde) + três cores de domínio (treino/nutrição/progresso). Verde também para guidance e streak.

## Typography

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| `display` | 34 | 700 | Saudação, valores hero |
| `title` | 22 | 600 | Títulos de seção |
| `body` | 17 | 400 | Corpo, guidance |
| `label` | 15 | 500 | Labels de métrica |
| `caption` | 13 | 400 | Metadados, datas |
| `metric` | 28–40 | 700 | Números tabulares (streak, macros) |

- **iOS:** SF Pro (system)
- **Android/Web:** Inter ou system sans
- Números: `fontVariant: ['tabular-nums']`

## Component Stylings

### Buttons
- **Primary:** fundo `primary`, texto `#000000`, pill, min height 50
- **Secondary:** fundo `surface` / `surfaceElevated`, borda hairline
- **Ghost:** texto `primary`, sem fundo — ações secundárias
- **Domain colors** só em anéis, dots de lista e barras de progresso — nunca em CTAs

### Cards & Lists
- Preferir **grouped lists** estilo iOS (radius 14, `surface` / `surfaceElevated`)
- Separadores inset à esquerda do texto
- Sem cards aninhados, sem bordas laterais coloridas
- Guidance como row dentro de grouped section, não hero colorido

### Activity Rings
- Track: cor do domínio a 22% opacidade
- Fill: cor do domínio sólida
- Stroke width: 12–14pt
- Três domínios: treino (amarelo), nutrição (laranja), progresso (azul)

### Tab Bar
- Ativo: `primary`
- Inativo: `inkSecondary`
- Fundo: `surface` com blur no iOS

## Layout Principles

- Grid base: 4pt
- Padding de tela: 20 horizontal
- Espaço entre seções: 24
- Touch target mínimo: 44pt
- Safe areas respeitadas em todas as telas

## Depth & Elevation

- Dark mode: elevação por luminância de surface (`#1C1C1E` → `#2C2C2E`), não sombra
- Light mode: sombra sutil `0 2px 8px rgba(0,0,0,0.06)` apenas em cards flutuantes

## Do's and Don'ts

**Do**
- Usar cores de domínio só no contexto certo (anel de treino = amarelo)
- Manter guidance como card único no topo quando relevante
- Priorizar OAuth (Google/Apple) sobre OTP no auth

**Don't**
- Cream/beige genérico como fundo light
- Cards dentro de cards
- Mais de uma cor de acento competindo na mesma tela
- Gradientes decorativos sem função

## Responsive Behavior

- Mobile-first; portal web usa mesmos tokens com layout multi-coluna
- i18n: `pt-BR` default, `en` completo — nunca hardcode strings na UI

## Agent Prompt Guide

```
Forma design: Apple Fitness precision × green primary #30D158.
Domain colors: training #FFD60A, nutrition #FF9F0A, progress #64D2FF.
Dark bg #000000 surface #1C1C1E; light bg #FFFFFF surface #F5F5F7.
Use tabular nums for metrics. Balanced density. System theme.
```
