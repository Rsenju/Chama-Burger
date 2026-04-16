# DECISIONS — Chama Burger

Registro das decisões técnicas relevantes, com contexto e alternativas descartadas.

---

## [DEC-001] — Stack vanilla (sem frameworks)

**Decisão:** HTML5 + CSS3 + JavaScript ES6+ sem frameworks.  
**Motivo:** Hospedagem estática (zero dependências de build), custo zero, máxima portabilidade.  
**Alternativas descartadas:** React, Vue, Svelte (adicionam complexidade de build sem ganho real para landing page).

---

## [DEC-002] — SheetDB como banco de dados

**Decisão:** SheetDB (REST API sobre Google Sheets) para persistência de dados.  
**Motivo:** Cliente sem infraestrutura de servidor; Google Sheets é editável diretamente pelo restaurante.  
**Limitações aceitas:** Rate limit da API gratuita; não usar para dados sensíveis.

---

## [DEC-003] — Cardápio via JSON externo

**Decisão:** `data/cardapio.json` separado do HTML.  
**Motivo:** Permite ao cliente editar itens, preços e disponibilidade sem tocar no código.  
**Fallback:** Se `fetch` falhar (arquivo local / sem servidor), o grid fica vazio sem quebrar a página.  
**Trade-off:** Requer servidor HTTP para funcionar (não abre direto via `file://`).

---

## [DEC-004] — Rate limit client-side com fallback de sessão

**Decisão:** Rate limit baseado em IP externo (`api.ipify.org`) com fallback para ID de sessão local.  
**Motivo:** Sem backend, o rate limit é uma camada de UX, não de segurança real.  
**Fallback implementado:** `sessionStorage` com token aleatório quando IP indisponível — evita anular a proteção com chave vazia.  
**Limitação documentada:** Usuário pode contornar limpando `sessionStorage`.

---

## [DEC-005] — Criptografia AES-GCM do consentimento LGPD

**Decisão:** Registro de consentimento criptografado com AES-256-GCM derivado de salt estático.  
**Motivo:** Demonstra boa-fé na LGPD com timestamp, IP e categorias registrados.  
**Limitação crítica:** Chave derivada de literal público no código-fonte — oferece integridade estrutural, não confidencialidade real. Em produção, mover para backend com HSM/KMS.

---

## [DEC-006] — PWA com fallback offline

**Decisão:** Service Worker com cache de assets estáticos e `offline.html` como fallback de navegação.  
**Motivo:** Melhora experiência em conexões instáveis (comum em mobile).  
**Estratégia:** Cache-first para assets; network-first implícito para fetch externo.

---

## [DEC-007] — Logos de delivery como SVG locais

**Decisão:** Logos iFood e 99Food como arquivos SVG em `assets/logos/`.  
**Motivo:** Evita dependência de CDN externo; SVG é escalável e sem perda.  
**Alternativa descartada:** SVG inline no HTML (dificulta manutenção).

---

## [DEC-008] — Imagens do cardápio com fallback em cadeia

**Decisão:** `cardapio-loader.js` tenta extensões `.jpg → .png → .webp → .svg` antes de usar placeholder inline.  
**Motivo:** Flexibilidade para cliente substituir placeholders por fotos reais em qualquer formato.  
**Fallback final:** Data URI SVG cinza com emoji 🍔 — nunca quebra o layout.

---

## [DEC-009] — `unsafe-inline` no CSP

**Decisão:** Mantido `script-src 'unsafe-inline'` no CSP.  
**Motivo:** Scripts de tracking (GTM/GA4) e JSON-LD no `<head>` exigem inline em site estático.  
**Mitigação parcial:** Todos os inputs são sanitizados antes de qualquer saída no DOM.  
**Caminho de melhoria:** Em produção com servidor, usar `nonce-*` por requisição.

---

## [DEC-010] — Estrutura de pastas imutável

**Decisão:** Nenhuma nova pasta pode ser criada fora da estrutura definida em `RULES.md`.  
**Motivo:** Manter previsibilidade para o cliente e para o copilot; evitar proliferação de estruturas paralelas.