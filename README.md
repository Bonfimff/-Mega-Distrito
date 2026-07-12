# Magé Express

Plataforma local de vendas e serviços para a cidade de Magé (RJ).

**Modelo de negócio:** o site principal funciona como marketplace/vitrine da cidade, e cada
estabelecimento local pode contratar uma **página própria** (e futuramente um "mini-app")
atrelada ao ecossistema principal.

*Iniciado em 24/04/2026.*

## Estrutura

```
index.html              Página principal (produtos, categorias, bazar, carrinho)
HTML/
  apps.html             Gaveta de apps (atalhos + loja de apps)
  feed.html             Feed da cidade (estilo reels)
  servicos.html         Profissionais de serviços + vagas de emprego
  gerenciamento.html    Painel de gerenciamento da loja (embrião do painel do lojista)
CSS/                    Um arquivo por página + style.css (base compartilhada)
JS/
  utils.js              Helpers compartilhados (brl, normalizar, toast) — carregar primeiro
  data/                 TODOS os dados vivem aqui, separados da lógica
    categorias.js       Categorias de produtos
    produtos.js         Produtos novos + bazar (usados)
    profissionais.js    Profissionais de serviços (cores, fotos, cadastro)
    vagas.js            Vagas de emprego
    apps-catalogo.js    Catálogo da loja de apps
    lojas.js            ★ Registro de estabelecimentos com página própria
  script.js             Lógica da página principal (render, carrinho, busca)
  apps.js               Lógica da gaveta de apps
  feed.js               Lógica do feed
  servicos.js           Lógica de serviços/vagas
  gerenciamento.js      Lógica do painel de gerenciamento
expo-app/               Wrapper Expo/React Native que gera o APK (ver README-APK.md)
android-compose-sample/ Exemplo isolado de navbar em Jetpack Compose (referência)
```

### Ordem de carregamento dos scripts

Toda página carrega, nesta ordem: `utils.js` → arquivos de `JS/data/` que usa → script da página.
Os dados são constantes globais (`PRODUTOS`, `LOJAS`, …) consumidas pelos scripts de página.

## Registro de lojas (`JS/data/lojas.js`)

É a fundação das páginas por estabelecimento. Cada entrada tem um `slug` único e o mesmo
schema do painel de gerenciamento (`GM_DEFAULT` em `gerenciamento.js`): identidade visual
(cores, banner, ícone), horário de funcionamento, filtros e itens (produtos/serviços).

Para "vender uma página" hoje: adicionar uma entrada em `lojas.js`.
A página `HTML/loja.html?id=<slug>` (próximo passo) renderiza a partir desses dados.

## Roadmap

- [ ] `HTML/loja.html` — template que renderiza a página de qualquer loja a partir de `lojas.js`
- [ ] Ligar o painel de gerenciamento ao registro de lojas (editar/salvar)
- [ ] Cards de lojas na página principal e na gaveta de apps apontando para `loja.html`
- [ ] Backend (cadastro/login de lojistas) — substituir `lojas.js` por API, mantendo o schema
- [ ] Programa de pontos de reciclagem (ideia registrada)

## Como rodar

É um site estático: abrir `index.html` no navegador (ou servir a pasta com qualquer
servidor estático). Para o APK, ver `expo-app/README-APK.md`.
