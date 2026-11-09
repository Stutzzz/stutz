# STUTZ — Design System

> Centro de comando à meia-noite, neon coral.
> Baseado na referência de estilo Raycast, adaptado para a STUTZ como agência de marketing.

**Tema:** escuro (o site inteiro é escuro — sem faixas claras).

## Conceito

A STUTZ se apresenta como o "painel de comando" do marketing do cliente: tudo que a marca precisa,
a um atalho de distância. O visual é austero e técnico — fundo quase preto, tipografia Inter em peso
regular, cards com efeito de "tecla de teclado" (sombra interna, não flutuante) e **um único acento
quente: o coral `#ff6363`**.

O hero é o único lugar onde o sistema "quebra as regras": gradientes vermelho/azul, desfoque e escala
grandes, como uma vinheta de abertura. Depois disso a página volta para a superfície escura e calma.
O azul do logo STUTZ conversa com o azul da arte do hero — por isso o logo só aparece em tamanho
pequeno (nav e rodapé) e nunca compete com o coral.

## Cores

| Nome | Valor | Token | Uso |
|------|-------|-------|-----|
| Void Black | `#040506` | `--void` | Fundo da página (único fundo permitido) |
| Ink | `#07080a` | `--ink` | Superfície de cards e painéis |
| Obsidian | `#111214` | `--obsidian` | Campos de formulário, áreas rebaixadas |
| Graphite | `#1b1c1e` | `--graphite` | Badges, tags |
| Slate | `#2f3031` | `--slate` | Bordas de botões fantasma |
| Hairline | `#363739` | `--hairline` | Bordas finas, divisores, nav |
| Iron | `#454647` | `--iron` | Texto sobre botão claro |
| Smoke | `#6a6b6c` | `--smoke` | Texto discreto, metadados |
| Ash | `#9c9c9d` | `--ash` | Texto secundário, links da nav |
| Mist | `#e6e6e6` | `--mist` | Preenchimento do botão principal |
| Pure White | `#ffffff` | `--white` | Títulos e texto de destaque |
| **Coral Pulse** | `#ff6363` | `--coral` | Acento de marca (ver regras abaixo) |
| Ember Hush | `#452324` | `--ember` | Fundo de card com tom coral |
| Electric Sky | `#63a1ff` | `--sky` | Somente arte do hero |
| Cobalt Edge | `#143ca3` | `--cobalt` | Somente arte do hero |
| Deep Space | `#02193b` | `--deep-space` | Somente arte do hero |

### Onde o coral pode aparecer
- Losango/ponto de marca ao lado do logo
- Arte do hero
- Linha selecionada no mockup de "command bar"
- Badge "IA" / destaques pontuais
- Card com fundo Ember Hush (o card de destaque de serviços)

### Onde o coral **não** pode aparecer
- Texto corrido, links, ícones gerais, bordas, botões de ação

## Tipografia

| Papel | Fonte | Peso | Tamanho | Line-height | Tracking |
|-------|-------|------|---------|-------------|----------|
| Eyebrow | Geist Mono | 400 | 11px, maiúsculas | 1.0 | 0.08em |
| Corpo | Inter | 400 | 16px | 1.6 | 0 |
| Corpo grande | Inter | 400 | 18px | 1.55 | 0 |
| Subtítulo | Inter | 500 | 20px | 1.3 | 0.01em |
| Título pequeno | Inter | 500 | 24px | 1.2 | 0 |
| Título | Inter | 500 | 32px | 1.15 | 0 |
| Título grande | Inter | 400 | 56px | 1.12 | 0.004em |
| Display | Inter | 600 | 64px | 1.05 | 0 |
| Nav / labels | Inter | 500 | 13–14px | 1.0 | 0.014em |
| Metadados | Geist Mono | 400 | 12px | 1.6 | 0.017em |

- **Inter** (Google Fonts) com `font-feature-settings: 'calt', 'kern', 'liga', 'ss03'`.
- **Geist Mono** (Google Fonts) para eyebrows, números de etapa, metadados e o rodapé técnico.
- O título do hero usa **peso 400** em tamanho grande — o tamanho faz o trabalho, não o negrito.
- Nunca usar tracking negativo em títulos grandes.

## Espaçamento

Base de **8px**. Valores permitidos: 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 96, 120.

- Largura máxima do conteúdo: **1200px**
- Margem lateral: 24px (16px no celular)
- Espaço entre seções: 120px (80px no celular)
- Padding de card: 24px (32px em cards largos)
- Gap entre elementos: 8–16px

## Raios

| Elemento | Raio |
|----------|------|
| Botões, inputs | 8px |
| Badges | 6px |
| Cards | 16px |
| Cards grandes / janela mockup | 20px |
| Pills | 9999px |
| Containers de ícone | círculo (99999px) |

## Sombras e elevação

Elevação vem de **bordas finas e sombras internas**, nunca de sombras externas grandes.

```css
/* "Tecla de teclado" — cards e blocos de destaque */
--shadow-key: rgba(255,255,255,0.05) 0 1px 0 0 inset,
              rgba(255,255,255,0.25) 0 0 0 1px,
              rgba(0,0,0,0.2) 0 -1px 0 0 inset;

/* Borda suave para cards comuns */
--shadow-edge: rgba(255,255,255,0.1) 0 1px 0 0 inset,
               rgba(255,255,255,0.06) 0 0 0 1px inset;

/* Botão claro */
--shadow-button: rgba(0,0,0,0.03) 0 7px 3px 0, rgba(0,0,0,0.25) 0 4px 4px 0;

/* Janela mockup flutuando sobre o hero */
--shadow-window: rgba(255,255,255,0.1) 0 1px 0 0 inset,
                 rgba(0,0,0,0.4) 0 30px 50px 0,
                 rgba(3,15,129,0.09) 0 4px 24px 0,
                 rgba(255,255,255,0.06) 0 0 0 1px inset;
```

## Componentes

### Nav de vidro
Barra flutuante fixa no topo, `backdrop-filter: blur(48px)`, borda 1px `--hairline`, raio 12px,
fundo `rgba(7,8,10,0.6)`. Logo à esquerda, links no centro (13px/500, Ash → White no hover),
botão "Fale conosco" (Mist) à direita. No celular os links viram um menu suspenso.

### Botão principal (neutro)
Fundo Mist, texto Iron, 14px/500, raio 8px, padding 10px 16px, `--shadow-button`.
**Não existe botão colorido** no sistema.

### Botão fantasma
Transparente, borda 1px `--slate`, texto White. Hover: fundo `rgba(255,255,255,0.05)`.

### Card de recurso ("tecla")
Fundo `--ink`, raio 16px, padding 24px, `--shadow-key`. Ícone em container circular,
título 20px/500 branco, corpo 16px Ash.

### Card de borda
Fundo transparente, borda 1px `--hairline`, raio 16–20px. Usado em listas e FAQ.

### Card Ember (destaque)
Fundo `--ember` com gradiente sutil para `--ink`, mesmo tratamento de "tecla". Um por página.

### Input rebaixado
Fundo `rgba(255,255,255,0.05)`, raio 8px, padding 12px, texto branco 16px, placeholder Ash.
Foco: anel 1px `rgba(255,255,255,0.25)`.

### Badge
Fundo Graphite, texto branco 12px, raio 6px, padding 2px 8px.

### Janela "command bar" (mockup)
Representa a STUTZ como um painel de comando de marketing. Moldura raio 20px, barra de busca
no topo, lista de resultados com raio 8px por linha; **a linha ativa usa o coral** como indicador.
Atalhos de teclado renderizados como mini "teclas" (Graphite + `--shadow-key`).

### Rodapé técnico
Linha em Geist Mono 12px, cor Smoke, itens separados por `|`.

## Layout da página

1. **Nav de vidro** (fixa)
2. **Hero** — eyebrow mono, título 56–64px/400, subtítulo Ash, 2 botões, linha mono de metadados,
   arte vermelho/azul ao fundo e mockup de "command bar"
3. **Faixa de canais** — nomes das plataformas em Smoke, rolagem contínua
4. **Serviços** — grid 3 colunas de cards "tecla" + 1 card Ember
5. **Cases / Projetos** — grid 2 colunas com imagens dos projetos
6. **Como funciona** — 4 etapas numeradas em Geist Mono
7. **Diferenciais** — lista em 2 colunas
8. **FAQ** — acordeão com cards de borda
9. **Contato** — formulário com inputs rebaixados + canais diretos
10. **Rodapé** — logo, links, linha técnica mono

## Faça
- Usar `#040506` como único fundo de página
- Reservar o coral para marca, arte do hero e o item ativo
- Aplicar a sombra "tecla" em cards de destaque
- Usar botões Mist com texto Iron para todas as ações principais
- Respeitar a grade de 8px
- Separar metadados com `|` em Geist Mono

## Não faça
- Botões coloridos (azul, vermelho, verde)
- Sombras externas grandes em cards
- Tracking negativo em títulos grandes
- Seções claras ou alternância claro/escuro
- Coral em texto corrido, links ou ícones gerais
- Mais de um acento de cor na mesma superfície
- Fotografia de banco de imagens — o "produto" (os projetos e o painel) é a imagem

## Movimento
- Entradas suaves: `opacity` + `translateY(16px)`, 600ms, `cubic-bezier(.2,.7,.2,1)`
- Hover em cards: borda clareia, sem "pulo"
- Respeitar `prefers-reduced-motion` (desliga animações)
