# STUTZ — Design System

> Escuro por padrão, gelo quando você quiser, sempre azul.

**Tema:** dois modos, com troca por um botão (sol / lua) na barra de navegação.
- **Escuro (padrão):** fundo `#0b0f16`, quase preto mas não 100%.
- **Claro:** branco gelo `#e3e9f0`, nunca branco puro.

A escolha de cada visitante fica salva no navegador (`localStorage`, chave `stutz-tema`).
O hero, a faixa "site que converte" e o rodapé são escuros nos dois modos.

## Conceito

A STUTZ trabalha com **desenvolvimento web**: landing pages e sites institucionais feitos do zero.
O site junta três referências:

1. **Raízes (agenciaraizes.com.br/sites)** — o corpo da página: fundo claro, muito respiro, títulos
   fortes, uma palavra de destaque colorida por título, e os projetos mostrados em **janelas de
   navegador estilo Mac** (bolinhas vermelha, amarela e verde) com borda escura e sombra sólida
   deslocada.
2. **Site original da STUTZ** — a identidade: azul `#0a74e6`, logo, fonte Clash Display, o hero escuro
   com as colunas azuis, o rodapé com vídeo e **todas as animações de rolagem** (lista abaixo).
3. **Versão Raycast** — a disciplina: uma única cor de destaque, nada de cores extras, grade de 8px.

A transição entre o hero e o corpo da página é feita pelas **11 colunas** que descem ao rolar —
elas têm a cor do fundo do tema (escuras no modo escuro, gelo no claro) e o texto aparece por cima.

## Cores

Os tokens ficam no topo do `style.css`: o bloco `:root[data-theme="light"]` define o claro e
`:root[data-theme="dark"]` sobrescreve para o escuro. Texto usa `--ink`; bordas usam `--edge`;
sombras sólidas usam `--hard`; textos em azul usam `--accent`.

### Modo escuro (padrão)

| Nome | Valor | Token | Uso |
|------|-------|-------|-----|
| Grafite | `#0b0f16` | `--bg` | Fundo principal |
| Grafite 2 | `#0f141d` | `--bg-2` | Faixas alternadas |
| Superfície | `#131a25` | `--paper` | Janelas, cards, campos |
| Texto | `#eef2f8` | `--ink` | Títulos |
| Texto 2 | `#b6bfcd` | `--ink-2` | Texto corrido |
| Cinza | `#8b95a8` | `--muted` | Texto secundário |
| Linha | `#222b3a` | `--line` | Divisores |
| Borda | `#35425b` | `--edge` | Bordas das janelas e cards |
| Sombra sólida | `#0b2a57` | `--hard` | Sombra deslocada (azul-marinho) |
| Destaque | `#4d9bff` | `--accent` | Palavra em destaque, eyebrows |

### Modo claro (branco gelo)

| Nome | Valor | Token | Uso |
|------|-------|-------|-----|
| Gelo | `#e3e9f0` | `--bg` | Fundo principal da página (branco gelo, nunca branco puro) |
| Gelo 2 | `#d6dee9` | `--bg-2` | Faixas alternadas (seções de apoio) |
| Gelo claro | `#f2f5f9` | `--paper` | Janelas, cards, campos (um passo acima do fundo) |
| Tinta | `#0b1220` | `--ink` | Títulos, bordas das janelas, sombras sólidas |
| Tinta 2 | `#3c4556` | `--ink-2` | Texto corrido |
| Cinza | `#6b7486` | `--muted` | Legendas, texto secundário |
| Linha | `#c5cfdc` | `--line` | Divisores finos, bordas suaves |
| **Azul STUTZ** | `#0a74e6` | `--blue` | Único destaque: botões, palavra em destaque, eyebrows, ícones |
| Azul escuro | `#003d82` | `--blue-dark` | Hover de botão, círculo do botão |
| Azul claro | `#4d9bff` | `--blue-light` | Detalhes sobre fundo escuro |
| Azul névoa | `#cddff7` | `--blue-tint` | Sombra do celular, fundos de ícone |
| Noite | `#02050b` | `--night` | Hero, rodapé, faixa do funil |
| Noite 2 | `#07101f` | `--night-2` | Cards sobre fundo escuro |

Bolinhas da janela Mac (só nas janelas): `#ff6b5e`, `#ffcf4c`, `#5ecb7a`.

### Regras de cor
- Azul é o **único** destaque. Nada de laranja, verde ou roxo na interface.
- Em cada título, no máximo **uma** palavra em azul.
- Fundo escuro só em três lugares: hero, faixa do funil e rodapé.
- Nada de branco puro (`#fff`) como fundo: o site fica no tom gelo para não cansar a vista.

## Tipografia

| Papel | Fonte | Peso | Tamanho | Line-height |
|-------|-------|------|---------|-------------|
| Hero | Clash Display | 500 | clamp(2.6rem, 5.6vw, 6.2rem) | 1.02 |
| Título de seção | Clash Display | 500 | clamp(2rem, 3.6vw, 3.5rem) | 1.08 |
| Texto de transição | Clash Display | 500 | clamp(2.2rem, 4.5vw, 5rem) | 1.2 |
| Título de card | Clash Display | 500 | 22–26px | 1.15 |
| Eyebrow | Inter | 600 | 12px, maiúsculas, tracking 0.14em | 1 |
| Corpo | Inter | 400 | 16–18px | 1.6 |
| Legenda | Inter | 500 | 13–14px | 1.4 |

- **Clash Display** vem dos arquivos em `assets/fonts/`.
- **Inter** vem do Google Fonts.
- Títulos com tracking levemente negativo (`-0.01em`); eyebrows com tracking positivo.

## Espaçamento e grade

- Base de **8px**. Valores: 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120.
- Largura máxima do conteúdo: **1240px**, margem lateral `4vw` (mínimo 16px).
- Espaço entre seções: 120px no desktop, 80px no celular.

## Raios

| Elemento | Raio |
|----------|------|
| Botões | pill (999px) |
| Janela Mac | 12px |
| Celular | 16px |
| Cards | 20px |
| Linhas do FAQ | 999px fechado → 24px aberto |

## Sombras

O site **não usa sombra difusa**. Profundidade vem de borda + sombra sólida deslocada (estilo Raízes):

```css
--shadow-hard: 7px 7px 0 0 var(--ink);        /* janelas e cards de destaque */
--shadow-hard-blue: 7px 7px 0 0 var(--blue);  /* hover */
--shadow-phone: 6px 6px 0 0 var(--blue-tint); /* celular sobre a janela */
```

## Componentes

### Nav flutuante
Pílula escura com vidro (`rgba(5,11,22,.72)` + `blur(20px)`), logo STUTZ original (S azul + texto
branco), links claros e botão azul "Solicitar orçamento". Funciona tanto sobre o hero escuro quanto
sobre o corpo claro. No celular vira o menu de tela cheia do site original, com o efeito de letras
rolando no hover.

### Botão principal
Pílula azul com seta; no hover, um círculo azul-escuro cresce da direita e preenche o botão
(efeito do site original).

### Botão secundário
Pílula transparente com borda de 1.5px (tinta no claro, branca no escuro).

### Janela Mac (portfólio)
- Fundo branco, borda `1.5px solid var(--ink)`, raio 12px, `--shadow-hard`.
- Barra superior com as três bolinhas (cada uma com borda de 1px tinta) e uma barra de endereço
  em pílula branca.
- Tela em proporção 2:1 mostrando o recorte do site do projeto.
- **Celular** sobreposto no canto inferior direito: borda 5px tinta, raio 16px, `--shadow-phone`.
- Abaixo: categoria em azul, maiúsculas, e o nome do projeto em cinza.

### Card de serviço
Fundo branco, borda `1px var(--line)`, raio 20px. Ícone em círculo azul-névoa com borda tinta.
Hover: borda tinta + `--shadow-hard`.

### Faixa "site que converte"
Fundo noite, etapas ligadas por uma linha vertical azul: Visitante → Landing page ou site → WhatsApp ou formulário → Cliente.

### Rodapé
Do site original: vídeo de fundo, "CONTATO" gigante com degradê branco → azul claro, botão
"Fale conosco" sobreposto, faixa com e-mail rolando, redes sociais em pílulas.

## Ordem da página

1. Nav flutuante
2. **Hero escuro** (imagem + vídeo de fundo, selo com vídeo, título, botões)
3. **Transição**: 11 colunas descem e o texto aparece letra por letra
4. **Cases**: carrossel infinito de janelas Mac (estilo Raízes)
5. **O que está em jogo**: problema do cliente, em lista com linha do tempo
6. **Serviços**: 6 cards
7. **Projetos em destaque**: imagens que crescem e ganham cor ao rolar
8. **Como funciona**: 4 cards empilhados que saem um a um
9. **Cards explodindo**: janelas que se abrem para os lados revelando a chamada
10. **Site que converte** (faixa escura)
11. **Suporte + tecnologias**: cards com seta girando e grade de tecnologias acendendo em loop
12. **Feedbacks**: texto à esquerda e colagem de 8 prints reais começando ao lado dele, na direita, e seguindo por baixo
13. **FAQ**
14. **Rodapé com contato**

## Animações (GSAP + ScrollTrigger + ScrollSmoother + SplitText)

| Animação | Onde | Como funciona |
|----------|------|---------------|
| Rolagem suave | página toda | ScrollSmoother, `smooth: 1.5` |
| 11 colunas | hero → transição | Hero fixado; as colunas crescem de 0% a 100% de altura em sequência |
| Texto letra a letra | transição | Letras sobem de dentro da linha (SplitText com máscara) |
| Títulos com desfoque | todos os `h2` | Letras surgem do blur, em ordem aleatória |
| Projetos crescendo | Projetos em destaque | Imagem vai de 60% a 100% da largura, perde o arredondamento e ganha saturação |
| Cards explodindo | seção de chamada | Janelas da esquerda e direita saem da tela girando ao rolar |
| Cards empilhados | Como funciona | Seção fixada; cada card sobe e some, o próximo endireita |
| Tecnologias acendendo | Suporte | 3 tecnologias acendem por vez, trocando a cada 2s |
| Seta girando | Suporte | Gira 180° conforme a rolagem |
| Letras rolando | menu do celular | Texto troca por uma cópia azul que sobe letra a letra |
| Carrossel de cases | Cases | Anda sozinho; para ao tocar ou passar o mouse e aceita arrastar |
| Feedbacks em ritmos | Feedbacks | Cada print sobe ou desce ao rolar no próprio ritmo (`data-ritmo`, em px) e entra uma vez com fade e zoom |
| Faixa de e-mail | Rodapé | Rolagem infinita em CSS |

Com `prefers-reduced-motion`, a rolagem suave, as colunas e os carrosséis ficam desligados.

## Faça
- Fundo gelo em todo o corpo; escuro só no hero, faixa "site que converte" e rodapé
- Uma palavra azul por título, no máximo
- Projetos sempre dentro da janela Mac ou em tela grande (seção "Projetos em destaque")
- Sombras sólidas deslocadas, nunca difusas
- Muito respiro: uma ideia forte por seção

## Não faça
- Cores de destaque além do azul
- Sombras borradas em cards
- Fotos de banco de imagem — os projetos são as imagens
- Textos longos em blocos; prefira listas curtas
