# Guia de Identidade Visual e Comportamento — Mega Distrito

> Documento de referência para decisões de design, UX e microcopy do projeto.
> Não é um manual genérico: cada princípio vem com a aplicação concreta no
> contexto do Mega Distrito (marketplace local + páginas de loja vendidas a
> estabelecimentos). Consulte antes de criar uma tela nova, revisar um fluxo
> ou discutir uma mudança visual.

---

## 0. Princípios norteadores

Antes de qualquer regra específica, cinco decisões já tomadas que tudo abaixo
deve servir:

1. **Confiança acima de conversão.** É um marketplace de bairro — o usuário
   compra de gente conhecida da cidade. Qualquer padrão que gere desconfiança
   (urgência falsa, preço escondido) destrói o ativo mais importante do produto.
2. **Mobile é o produto, desktop é o extra.** A maioria dos lojistas e clientes
   vai acessar pelo celular. Toda decisão de layout começa no mobile.
3. **Cada loja precisa ter identidade própria, mas o app precisa parecer um só.**
   Isso é uma tensão real (ver seção 9) — o sistema de cores por loja
   (`primary`/`accent` em `lojas.js`) já existe para isso; o "casco" (header,
   navegação, tipografia, espaçamento) deve continuar padronizado.
4. **Simplicidade visual > ornamentação.** É um site estático hoje, sem
   framework — animações e efeitos custosos (parallax pesado, glass blur em
   excesso) custam caro em manutenção e performance. Prefira poucos efeitos
   bem executados a muitos.
5. **Persuasão sim, manipulação não.** Ver seção 3.4 — vieses cognitivos serão
   usados para reduzir esforço e ansiedade de compra, nunca para enganar.

---

## 1. Leis de UX (psicologia da interação)

Curadoria baseada em *Laws of UX* (Jon Yablonski) e Nielsen Norman Group.
Cada uma com a aplicação direta nas páginas que já existem.

| Lei | O que diz | Aplicação no Mega Distrito |
|---|---|---|
| **Lei de Jakob** | Usuários preferem interfaces que já conhecem de outros produtos. | Carrinho, busca e cards de produto devem parecer os de Mercado Livre/iFood/Shopee — não reinvente o ícone de carrinho ou o layout de card. |
| **Lei de Hick** | Tempo de decisão cresce com o número de opções. | `filter-tabs` no index já limita a poucas categorias visíveis + "Todos" — manter esse padrão em vez de listar todas as categorias de uma vez. No painel de gerenciamento, é por isso que faz sentido dividir em etapas (Dados/Aparência/Horários) em vez de um formulário único. |
| **Lei de Fitts** | Quanto maior e mais perto o alvo, mais rápido e preciso o clique. | Botões primários de ação (Adicionar ao carrinho, Salvar Loja, Finalizar Compra) sempre grandes, no polegar (bottom-nav flutuante já segue isso). Não colocar ações destrutivas (Remover) do mesmo tamanho/perto do botão principal. |
| **Efeito estético-usabilidade** | Design bonito é percebido como mais usável, mesmo com falhas reais. | Vale investir em fotos de produto consistentes e boa tipografia — isso compra tolerância do usuário para partes ainda incompletas do produto (ex.: painel de gerenciamento sem backend). |
| **Lei de Miller (7±2)** | Memória de trabalho segura poucos itens por vez (~4-7). | Cards de item no `gerenciamento.js` já resumem em uma linha (preço · categoria · marca...) em vez de listar 10 campos soltos — correto. Menus e listas de filtros devem evitar passar de ~7 chips visíveis sem scroll. |
| **Efeito Von Restorff** | O item visualmente diferente é o que se lembra. | Usar para destacar 1 oferta do dia ou 1 loja em destaque — não para todo mundo (se tudo se destaca, nada se destaca). Hoje o badge "Novidades toda semana" no banner já cumpre esse papel. |
| **Efeito Zeigarnik** | Tarefas incompletas são lembradas melhor que as completas. | Uma barra de progresso no cadastro da loja (Etapa 1/3 preenchida) aumenta a chance do lojista terminar o cadastro. Vale aplicar no painel de gerenciamento. |
| **Peak-End Rule** | A lembrança de uma experiência é definida pelo pico emocional e pelo final, não pela média. | O fim da compra (confirmação do pedido, tela de "loja salva") precisa ser o momento mais cuidado da jornada, não um toast genérico. |
| **Princípio da posição serial** | Lembramos melhor o primeiro e o último item de uma lista. | Nos filtros e categorias, colocar a opção mais importante (ou "Todos") sempre primeiro; a ação de maior prioridade sempre no fim de uma sequência de botões. |

**Fontes:** [Laws of UX — UX Design Institute](https://www.uxdesigninstitute.com/blog/laws-of-ux/) · [The laws of UX — Nulab](https://nulab.com/learn/design-and-ux/laws-of-ux/) · [Maze — 21 Main UX Laws](https://maze.co/collections/ux-ui-design/ux-laws/) · [LogRocket — 14 cognitive principles](https://blog.logrocket.com/ux-design/cognitive-principles-for-ux-designers/)

---

## 2. Princípios de Gestalt (percepção visual)

| Princípio | Regra | Onde aplicar |
|---|---|---|
| **Proximidade** | Elementos próximos são percebidos como um grupo. | Preço e botão "Adicionar" de um produto devem ficar visualmente colados; campos de um mesmo tema no formulário (ex.: os novos grupos "Identificação", "Preço e mídia" do painel) devem ter respiro claro entre grupos e pouco respiro dentro do grupo. |
| **Similaridade** | Elementos parecidos (cor, forma, tamanho) são lidos como do mesmo tipo. | Todo card de produto/serviço deve manter mesmo raio, sombra e proporção de imagem — isso já é feito no `products-grid`; manter ao criar `loja.html`. |
| **Continuidade** | O olho segue linhas e sequências, não pula. | Trilho horizontal de categorias (`cat-rail`) funciona porque cria uma continuidade de scroll — não trocar por grid quebrado no mobile. |
| **Fechamento (Closure)** | O cérebro completa formas incompletas. | Pode-se cortar um card na borda da tela (mostrando "tem mais para o lado") para sugerir scroll horizontal — técnica já meio-usada no bazar/trilhos. |
| **Figura-fundo** | O elemento ativo precisa se destacar claramente do fundo. | Aba ativa do painel de gerenciamento (`.gm-tab.active`) já usa fundo branco + sombra contra fundo cinza — é o padrão certo, replicar em qualquer nova navegação por abas. |
| **Região comum** | Elementos dentro de um mesmo contorno/fundo são lidos como relacionados. | Uma `section` com fundo levemente diferente (como `.gm-form-section`) agrupa campos sem precisar de bordas pesadas em cada campo. |

**Fontes:** [Gestalt Principles — IxDF](https://ixdf.org/literature/topics/gestalt-principles) · [Superside — 11 Gestalt Principles](https://www.superside.com/blog/gestalt-principles-of-design) · [Figma — What Are The Gestalt Principles?](https://www.figma.com/resource-library/gestalt-principles/)

---

## 3. Vieses cognitivos de decisão de compra

### 3.1 Os principais para um marketplace local

| Viés | Mecanismo | Aplicação recomendada no Mega Distrito |
|---|---|---|
| **Prova social** | Confiamos na escolha de quem é "como nós". | Mostrar número real de avaliações/vendas por loja quando existir dado real. **Nunca inventar número.** |
| **Ancoragem** | O primeiro preço visto vira referência para julgar os demais. | Preço "de/por" no Bazar e Ofertas do Dia (já sugerido no roadmap) — mas só quando o "de" for um preço real praticado antes, não inflado. |
| **Aversão à perda** | Dói mais perder algo do que é bom ganhar o equivalente. | "Só resta 1 no bazar" é aceitável **quando for verdade** (o app já teria esse dado via `qty`). Nunca simular contador regressivo falso. |
| **Escassez** | O que é limitado parece mais valioso. | Usar `qty` real dos itens (já existe no schema de `lojas.js`) para mostrar "últimas unidades" de forma verídica. |
| **Efeito isca (decoy effect)** | Uma 3ª opção intermediária faz uma das duas principais parecer óbvia. | Ao desenhar planos de assinatura para lojistas (futuro), oferecer 3 planos em vez de 2 — o do meio costuma converter mais quando bem posicionado. |
| **Efeito de posse (endowment)** | Uma vez "no carrinho", o item parece mais seu, mais difícil de abandonar. | O carrinho lateral já persiste durante a navegação — reforça isso; evitar zerar o carrinho sem aviso. |
| **Redução de esforço percebido** | Preencher menos campos parece mais fácil, mesmo que o resultado seja igual. | O wizard por etapas do painel de gerenciamento (Dados → Aparência → Horários) já faz isso bem: quebra 1 tarefa grande em passos pequenos. |

### 3.2 Cores e psicologia (ver também seção 6.1)

- **Azul** transmite confiança e segurança — é por isso que é a cor mais usada
  em identidade de marca no mundo todo; o `--blue` do projeto já cumpre esse
  papel nos CTAs secundários e em serviços de saúde/farmácia.
- **Verde** sinaliza ação positiva ("Finalizar Compra", "Adicionar"), além de
  já ser a cor-âncora do Mega Distrito — reforça continuidade de marca.
- **Vermelho** deve ficar reservado a urgência real (poucas unidades, oferta
  relâmpago) e a estados de erro/remoção — nunca decorativo, para não perder força.

### 3.3 Onde a persuasão vira manipulação (dark patterns) — linha vermelha

Não implementar, nunca:

- Contadores de "tempo restante" ou "X pessoas vendo agora" que não vêm de dado real.
- Custos escondidos que só aparecem no checkout (taxa de entrega surpresa).
- Pré-marcar caixas de assinatura/upsell que o usuário precisa notar para desmarcar.
- Dificultar cancelamento/remoção mais do que a ação de adicionar (ex.: botão
  "Remover" pequeno e cinza enquanto "Comprar" é grande e colorido — beleza,
  mas nunca ilegível).
- Reviews falsas ou infladas.

A diferença entre persuasão ética e dark pattern é **transparência + reversibilidade**:
o usuário sempre entende o que está acontecendo e pode desfazer facilmente.

**Fontes:** [AufaitUX — Cognitive Bias in UX](https://www.aufaitux.com/blog/cognitive-bias-ux-design/) · [Dark Patterns vs Ethical Persuasion](https://f1studioz.com/blog/dark-patterns-vs-ethical-persuasion-drawing-the-line-in-modern-ux/) · [GeekyAnts — Dark UX Patterns vs Ethical Design](https://geekyants.com/en-us/blog/dark-ux-patterns-vs-ethical-design-a-comprehensive-guide) · [Color Psychology in E-commerce](https://designshifu.com/color-psychology-in-e-commerce/)

---

## 4. Heurísticas de usabilidade (Nielsen, aplicadas)

1. **Visibilidade do status do sistema** — todo toggle, adição ao carrinho ou
   salvamento precisa de feedback imediato (o `toast()` de `utils.js` já cumpre
   isso; usar sempre, nunca uma ação silenciosa).
2. **Correspondência com o mundo real** — linguagem de loja de bairro, não
   jargão técnico ("Retirada na loja", não "Pickup point").
3. **Controle e liberdade do usuário** — sempre dar "Cancelar"/"Limpar campos"
   perto de qualquer ação de criação (já existe em `gerenciamento.js`).
4. **Consistência e padrões** — um mesmo componente (card, botão, filtro) deve
   se comportar sempre igual entre `index.html`, `servicos.html`, `loja.html`.
5. **Prevenção de erro** — validar antes de salvar (o `collectItemFromForm`
   já bloqueia item sem nome/categoria — manter esse padrão em novos formulários).
6. **Reconhecer em vez de lembrar** — mostrar opções (categorias, filtros) em
   vez de exigir que o usuário digite de cabeça.
7. **Flexibilidade e eficiência de uso** — busca com autocomplete/atalhos para
   quem já sabe o que quer, sem obrigar todo mundo a navegar por categoria.
8. **Estética e design minimalista** — cada tela deve ter 1 ação primária óbvia.
9. **Ajudar o usuário a reconhecer e corrigir erros** — mensagens de erro em
   português claro, dizendo o que fazer ("Informe o nome do item"), não só "erro".
10. **Ajuda e documentação** — descrições curtas (`<small>`) já usadas nos
    campos do painel são a forma certa de ajuda contextual; evitar manuais longos.

**Fonte:** [Nielsen's 10 Usability Heuristics — Heurio](https://www.heurio.co/nielsens-10-usability-heuristics)

---

## 5. Sistema visual

### 5.1 Cor — estado atual + expansão recomendada

O projeto já define tokens em `CSS/style.css`:

```css
--green-xdark: #1b5e20;  --green-dark: #2e7d32;  --green: #388e3c;
--green-mid: #43a047;    --green-light: #66bb6a; --green-pale: #e8f5e9;
--blue-dark: #01579b;    --blue: #0288d1;        --blue-light: #b3e5fc; --blue-pale: #e1f5fe;
--gray-50..900; --white
```

Isso é uma boa base (verde = marca/ação positiva, azul = confiança/links).
Faltam tokens semânticos — hoje o código usa a cor "crua" (`--green-dark`) em
vez do papel dela. Recomenda-se adicionar uma camada semântica por cima:

```css
--color-primary: var(--green-dark);
--color-primary-hover: var(--green-xdark);
--color-action: var(--green);        /* CTAs de compra */
--color-info: var(--blue);           /* links, confiança */
--color-danger: #c62828;             /* remover, erro — ainda não existe token */
--color-warning: #e8a33d;            /* estoque baixo, atenção — ainda não existe */
--color-surface: var(--white);
--color-surface-alt: var(--gray-50);
```

Isso permite trocar a cor de uma loja individual (`primary`/`accent` de
`lojas.js`) sem tocar na cor semântica do app (ex.: "erro" continua vermelho
mesmo numa loja com tema roxo).

### 5.2 Tipografia

Hoje: `--font: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;` —
fonte de sistema, leve e correta para um site estático (sem custo de carregamento).
**Manter fonte de sistema** é a decisão certa para performance; não é o ponto
fraco do projeto.

O que falta é uma **escala tipográfica** formal (hoje os tamanhos são definidos
ad-hoc por arquivo CSS). Recomenda-se adotar uma escala de razão ~1.25:

```css
--text-xs:   .75rem;   /* 12px — legendas, small */
--text-sm:   .875rem;  /* 14px — corpo secundário */
--text-base: 1rem;     /* 16px — corpo padrão */
--text-md:   1.125rem; /* 18px — subtítulos */
--text-lg:   1.375rem; /* 22px — títulos de seção */
--text-xl:   1.75rem;  /* 28px — título de página */
--text-2xl:  2.25rem;  /* 36px — hero/banner */
```

Regra prática: a **line-height** deve sempre cair em múltiplo de 8 (ver 5.3),
mesmo quando o `font-size` não for múltiplo de 8 — é o que faz o texto "encaixar"
no grid vertical.

### 5.3 Espaçamento — grid de 8pt (ainda não formalizado no projeto)

Não há tokens de espaçamento hoje (`gap`/`padding`/`margin` são valores soltos:
`8px`, `10px`, `12px`, `14px`, `18px`...). Recomenda-se convergir para múltiplos
de 8 (com meio-passo de 4 para ícones/textos pequenos):

```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
--space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
```

Não precisa ser uma refatoração imediata — mas todo componente **novo** deve
nascer usando essa escala, para não crescer a dívida.

### 5.4 Elevação, raio e sombra (já formalizado — manter)

```css
--radius: 14px; --radius-sm: 8px;
--shadow-sm: 0 2px 8px rgba(0,0,0,.08);
--shadow-md: 0 4px 20px rgba(0,0,0,.13);
--shadow-lg: 0 8px 40px rgba(0,0,0,.18);
```

Já existe e já é usado de forma consistente (cards, painel, sidebar do carrinho).
Regra: **sombra maior = camada mais "flutuante" e temporária** (modal, drawer);
sombra menor = elemento fixo na página (card de produto).

### 5.5 Iconografia

Font Awesome 6 (via CDN) já é o padrão em todas as páginas — manter uma única
biblioteca de ícones no projeto todo (nunca misturar com emoji ou outro set,
isso quebra a similaridade/Gestalt do sistema).

**Fontes:** [Cieden — Spacing Best Practices](https://cieden.com/book/sub-atomic/spacing/spacing-best-practices) · [Design Systems — Space, Grids and Layouts](https://www.designsystems.com/space-grids-and-layouts/) · [Typography Systems — Make It Clear](https://makeitclear.com/typography-systems/)

---

## 6. Motion e microinterações

Tendência 2026 confirmada pela pesquisa: motion deixou de ser "enfeite" e virou
linguagem funcional — mas o excesso é visto como agressivo/datado.

Regras práticas para o projeto:

- **Toda animação precisa justificar uma pergunta do usuário**: "o que mudou?",
  "o que vai acontecer se eu clicar?", "isso terminou?". Se não responde a
  nenhuma, é decoração e deve ser cortada.
- **Duração curta**: 150–250ms para hover/click, até 350ms para painéis
  (abrir carrinho, gaveta de apps) — já é aproximadamente o que `--transition:
  .3s ease` faz hoje. Manter.
- **Easing**: `ease-out` para elementos entrando (sensação de resposta rápida),
  `ease-in` para saindo.
- **Glassmorphism/"liquid glass"**: só se houver um motivo de profundidade real
  (ex.: um painel flutuante sobre conteúdo de loja com banner colorido) — usar
  com moderação, nunca em texto de leitura longa (prejudica contraste).
- **Skeleton/loading state**: ao carregar itens de uma loja (`loja.html`
  futuro), preferir skeleton screens a spinners — reduz ansiedade de espera
  (ligado ao Peak-End Rule da seção 1).

**Fontes:** [Pixelmatters — 7 UI design trends 2026](https://www.pixelmatters.com/insights/7-UI-design-trends-to-watch-in-2026) · [Envato — UX/UI trends 2026: calm interfaces](https://elements.envato.com/learn/ux-ui-design-trends)

---

## 7. Padrões específicos de marketplace local

### 7.1 O modelo mental certo: Match → Trust → Transact

E-commerce comum pensa "Mostrar → Comprar". Marketplace (múltiplos vendedores)
precisa pensar em 3 etapas:

1. **Match** — ajudar o usuário a achar a loja/produto certo (busca, categorias,
   trilho de destaque).
2. **Trust** — antes de comprar de um desconhecido (mesmo que seja "da cidade"),
   o usuário precisa de sinais de confiança: horário de funcionamento claro,
   endereço real, avaliações, tempo de resposta.
3. **Transact** — só então o carrinho/checkout. Se pular direto para "Transact"
   sem "Trust", a conversão despenca em marketplaces novos sem reputação ainda.

Isso justifica por que `lojas.js` já guarda `address`, `phone`, `openTime`,
`closedDates` — são dados de **Trust**, não apenas operacionais. Ao construir
`loja.html`, esses dados devem aparecer **antes** do catálogo, não depois.

### 7.2 Mobile: navegação por polegar

- Bottom nav flutuante (já implementado) é o padrão correto para 2026 —
  manter os itens mais usados (Início, Carrinho, Conta) ao alcance do polegar.
- Gestos (swipe para ver mais fotos de um produto, double-tap para favoritar)
  são esperados pelo usuário que já usa Shopee/Instagram — considerar para o
  carrossel de fotos de produto quando houver mais de uma imagem por item.

### 7.3 WhatsApp como canal, não só como contato

Como o footer já expõe WhatsApp, vale formalizar: no Brasil, o "checkout"
informal por WhatsApp é esperado e confiável, especialmente para lojas
pequenas. Um botão "Chamar no WhatsApp" direto no card do item/loja
(`https://wa.me/<numero>?text=...`) tende a converter melhor que formulário
para lojista que ainda não tem operação de e-commerce madura.

**Fontes:** [Rigby — What Good Marketplace UX Design Looks Like](https://www.rigbyjs.com/blog/marketplace-ux) · [Gapsy — Ultimate Guide to Marketplace Design](https://gapsystudio.com/blog/marketplace-ui-ux-design/) · [WhatsApp Commerce in Latin America](https://sherlockcomms.com/whatsapp-commerce-in-latin-america/)

---

## 8. Referências de mercado (o que copiar, o que evitar)

| Marca | Estratégia de identidade | O que aproveitar no Mega Distrito | O que não copiar (ainda) |
|---|---|---|---|
| **Nubank** | Tom de voz como ativo de marca; fonte proprietária (Nu Sans); roxo único e reconhecível. | Ter uma "voz" consistente nos textos (toasts, microcopy) — hoje já é informal e direto, é o caminho certo. | Fonte proprietária: caro e desnecessário num site estático — manter fonte de sistema. |
| **iFood** | Economia de elementos (minimalismo funcional). | Cada card mostra só o essencial (nome, preço, 1 imagem, 1 ação) — o painel de gerenciamento já converge pra isso. | Evitar herdar a complexidade de features do iFood (avaliação, cupom, chat) antes de validar o básico. |
| **Mercado Livre** | Arquitetura de sub-marcas (Mercado Pago, Mercado Envios...). | O conceito de "cada loja tem sua identidade visual própria dentro do mesmo app" (já é exatamente o modelo do Mega Distrito via `lojas.js`). | Não crie sub-marcas separadas cedo demais — o Mega Distrito ainda é 1 produto, a "sub-marca" certa é a própria loja do lojista. |

**Fontes:** [Nubank Brand Refresh](https://blog.nubank.com.br/brand-refresh-como-renovamos-a-identidade-visual-do-nubank/) · [Pentagram — Nubank](https://www.pentagram.com/work/nubank)

---

## 9. Tensão a resolver: identidade única do app vs. identidade de cada loja

Este é o ponto de design mais específico do seu produto (nenhum artigo genérico
resolve isso por você):

- O **casco do app** (header, bottom-nav, tipografia, espaçamento, ícones,
  tom de voz dos toasts) deve ser **sempre igual**, para o usuário nunca se
  sentir "em outro site" ao entrar numa loja.
- A **loja individual** (banner, cores `primary`/`accent`, ícone) pode variar
  livremente — é literalmente o produto que você vende ao lojista.
- Regra prática: cor da loja pode pintar banners, botões de ação da própria
  loja e badges — mas nunca a navegação global (bottom-nav, header) nem os
  estados de sistema (erro é sempre vermelho, sucesso é sempre verde,
  independente da cor da loja). Isso já está implícito no uso de
  `--gm-primary`/`--gm-accent` como variáveis locais ao componente `.gm-phone`
  em vez de sobrescrever tokens globais — manter esse padrão ao construir
  `loja.html`.

---

## 10. Checklist rápido ao criar/revisar uma tela

- [ ] Existe 1 ação primária óbvia (Lei de Hick)?
- [ ] O alvo de toque tem no mínimo ~44px e está ao alcance do polegar (Fitts)?
- [ ] O componente parece com algo que o usuário já usou em outro app (Jakob)?
- [ ] Toda ação dá feedback imediato (toast, troca de estado visual)?
- [ ] Erros são evitados antes de acontecer (validação) e, se acontecerem,
      explicam o que fazer?
- [ ] Cores/ícones seguem os tokens existentes, não valores soltos novos?
- [ ] Alguma animação nova responde a uma pergunta real do usuário, ou é só decoração?
- [ ] Nenhum dado de urgência/escassez/prova social é fictício?
- [ ] Dados de confiança (endereço, horário, contato) aparecem antes do catálogo?

---

## 11. Bibliografia

- [Laws of UX — UX Design Institute](https://www.uxdesigninstitute.com/blog/laws-of-ux/)
- [The Laws of UX — Nulab](https://nulab.com/learn/design-and-ux/laws-of-ux/)
- [21 Main UX Laws — Maze](https://maze.co/collections/ux-ui-design/ux-laws/)
- [14 Cognitive Principles for UX Designers — LogRocket](https://blog.logrocket.com/ux-design/cognitive-principles-for-ux-designers/)
- [Gestalt Principles — Interaction Design Foundation](https://ixdf.org/literature/topics/gestalt-principles)
- [11 Gestalt Principles of Design — Superside](https://www.superside.com/blog/gestalt-principles-of-design)
- [Nielsen's 10 Usability Heuristics — Heurio](https://www.heurio.co/nielsens-10-usability-heuristics)
- [Cognitive Bias in UX: Designing with Psychology — AufaitUX](https://www.aufaitux.com/blog/cognitive-bias-ux-design/)
- [Dark Patterns vs Ethical Persuasion](https://f1studioz.com/blog/dark-patterns-vs-ethical-persuasion-drawing-the-line-in-modern-ux/)
- [Dark UX Patterns vs. Ethical Design — GeekyAnts](https://geekyants.com/en-us/blog/dark-ux-patterns-vs-ethical-design-a-comprehensive-guide)
- [Color Psychology in E-commerce — DesignShifu](https://designshifu.com/color-psychology-in-e-commerce/)
- [What Conversion Data Says About Brand Colors — Ritner Digital](https://www.ritnerdigital.com/blog/what-the-conversion-data-actually-says-about-brand-colors)
- [Spacing Best Practices (8pt grid) — Cieden](https://cieden.com/book/sub-atomic/spacing/spacing-best-practices)
- [Space, Grids and Layouts — Design Systems](https://www.designsystems.com/space-grids-and-layouts/)
- [Typography Systems — Make It Clear](https://makeitclear.com/typography-systems/)
- [7 UI Design Trends 2026 — Pixelmatters](https://www.pixelmatters.com/insights/7-UI-design-trends-to-watch-in-2026)
- [UX/UI Design Trends 2026: Calm Interfaces — Envato](https://elements.envato.com/learn/ux-ui-design-trends)
- [What Good Marketplace UX Design Looks Like — Rigby](https://www.rigbyjs.com/blog/marketplace-ux)
- [The Ultimate Guide to Marketplace Design — Gapsy](https://gapsystudio.com/blog/marketplace-ui-ux-design/)
- [WhatsApp Commerce in Latin America](https://sherlockcomms.com/whatsapp-commerce-in-latin-america/)
- [Nubank Brand Refresh](https://blog.nubank.com.br/brand-refresh-como-renovamos-a-identidade-visual-do-nubank/)
- [Nubank — Pentagram](https://www.pentagram.com/work/nubank)
- [Marcas brasileiras mais valiosas — Allidem](https://insights.allidem.com/como-lideram-as-marcas-brasileiras-mais-valiosas)

---

*Última atualização: 13/07/2026. Revisar quando o produto ganhar backend real
(dados de confiança deixam de ser estáticos) ou quando a primeira loja pagante
for onboardada (o momento certo para validar a seção 9 na prática).*
