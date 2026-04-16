# CHANGELOG — Chama Burger

Todas as mudanças relevantes do projeto são documentadas aqui.  
Formato: `[VERSÃO] — Data · Tipo · Descrição`

---

## [1.2.0] — 2026-04-16 · Funcionalidade

### Adicionado
- `data/cardapio.json` — dados externos do cardápio (Mudança 4)
- `js/cardapio-loader.js` — lê JSON e renderiza cards dinamicamente com fallback (Mudança 4)
- `assets/images/cardapio/` — 6 placeholders SVG para os itens do cardápio (Mudança 1)
- `assets/logos/ifood.svg` — logo iFood em SVG (Mudança 2)
- `assets/logos/99food.svg` — logo 99Food em SVG (Mudança 2)
- `offline.html` — página de fallback para PWA offline (QA)
- `CHANGELOG.md`, `DECISIONS.md`, `COMO_FAZER.md`, `TROUBLESHOOTING.md` — documentação

### Alterado
- `css/components.css` — cardápio: `aspect-ratio 4/3`, hover `scale(1.05)` 300ms, fallback cinza (Mudança 1)
- `css/components.css` — delivery: logos via `<img>` local, hover adicionado (Mudança 2)
- `css/components.css` — formulário: gap 20px, height 48px, padding 16px, label 0.9rem (Mudança 3)
- `css/components.css` — checkbox LGPD: layout horizontal (Mudança 3)
- `css/components.css` — botão CTA: `padding 14px 28px`, `font-size 0.95rem` (Mudança 3)
- `css/components.css` — `.nav-mobile` com `z-index: 200` (QA)
- `css/main.css` — `@import` redundante de `tokens.css` removido (QA)
- `index.html` — delivery cards com `<img>` dos logos locais (Mudança 2)
- `index.html` — `id="menu-grid-dinamico"` no grid do cardápio (Mudança 4)
- `index.html` — `cardapio-loader.js` incluído nos scripts (Mudança 4)
- `index.html` — `aria-modal="true"` + `aria-describedby` no banner LGPD (QA)
- `index.html` — `<track>` removido (arquivo `.vtt` inexistente) (QA)
- `index.html` — `aria-label` de estrelas em todos os depoimentos (QA)
- `index.html` — `alt` descritivo nos avatares dos depoimentos (QA)
- `index.html` — `autocomplete="off"` + aviso nos campos de checkout demo (QA)
- `manifest.json` — ícones separados por `purpose: any` e `purpose: maskable` (QA)
- `sw.js` — estratégia de fallback offline adicionada (QA)
- `js/security.js` — fallback de rate limit via `sessionStorage` quando IP indisponível (QA)
- `js/main.js` — form desabilitado graciosamente sem `CHAMASecurity` (QA)
- `js/main.js` — countdown persistente via `sessionStorage` (QA)
- `js/lgpd.js` — comentário técnico sobre limitação criptográfica (QA)
- `404.html` — imports CSS corrigidos (`style.css` inexistente → imports reais) (QA)
- `README.md` — estrutura de arquivos e seção de segurança/LGPD atualizadas (QA)

---

## [1.1.0] — 2026-04-14 · Segurança / QA

> Auditoria completa de QA Senior. Ver detalhes em `DECISIONS.md`.

---

## [1.0.0] — 2026-04-14 · Lançamento inicial

- Estrutura base do projeto
- Landing page com hero, cardápio, delivery, depoimentos, fidelidade, oferta, formulário
- LGPD completo (banner, modal, registro criptografado AES-GCM)
- PWA (manifest, Service Worker)
- Integração WhatsApp via `wa.me`
- Páginas legais (`politica-privacidade.html`, `termos-de-uso.html`)