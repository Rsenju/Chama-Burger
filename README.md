<div align="center">

# Chama Burger — Landing de Alta Conversão

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Landing page premium para hamburgueria — performance, UX e funil de pedidos integrado ao WhatsApp.**

[Como rodar](#-como-rodar-o-projeto) · [Funcionalidades](#-funcionalidades) · [Segurança e LGPD](#-segurança-e-lgpd) · [Preview](#-preview)

</div>

---

## Descrição

**Chama Burger** é uma landing page estática, moderna e orientada a resultados, desenvolvida para simular o site oficial de uma hamburgueria focada em **pedidos online e contato imediato**. O layout combina hierarquia visual forte, copy persuasiva e jornada clara até o CTA — priorizando **conversão** (pedidos e leads), não apenas apresentação visual.

O projeto demonstra domínio de **front-end sem frameworks**, integração prática com **WhatsApp via links (`wa.me`)** e decisões de **UX/UI alinhadas a marketing digital** e boas práticas de mercado em **2026**.

---

## Objetivo do projeto

| Eixo | Entrega |
|------|---------|
| **Vendas** | CTAs visíveis, cardápio com preços, oferta com urgência e múltiplos pontos de contato com WhatsApp. |
| **UX** | Navegação clara, formulário com feedback de erro/sucesso, scroll suave, mobile-first e acessibilidade (landmarks, labels, skip link, aria-live). |
| **Marketing** | Gatilhos de urgência e escassez, prova social, headline orientada a benefício e reforço de conversão no fechamento da página. |

Cenário simulado: restaurante real que precisa **captar pedidos pelo celular**, reduzir atrito na comunicação e **padronizar mensagens** enviadas à equipe no WhatsApp.

---

## Tecnologias utilizadas

- **HTML5** — estrutura semântica (`header`, `main`, `section`, `nav`, `footer`), headings hierárquicos e SEO básico (title, meta description, Schema.org JSON-LD).
- **CSS3** — layout responsivo **mobile-first**, variáveis CSS (design tokens), tipografia do sistema (sem dependência externa de fontes), componentes reutilizáveis e estados de hover/foco.
- **JavaScript (ES5+)** — validação e sanitização anti-XSS/SQLi, rate limit client-side com fallback de sessão, LGPD/cookies com registro criptografado (Web Crypto AES-GCM quando disponível), contador de oferta persistente por sessão, menu mobile, animação on-scroll e botão flutuante.
- **PWA** — Service Worker com cache de assets, fallback offline e prompt de instalação.
- **WhatsApp** — abertura de conversa com **mensagem pré-formatada** através da API pública de links: [`https://wa.me`](https://wa.me) (sem backend obrigatório).

---

## Funcionalidades

- **Hero de impacto** — foto LCP otimizada (AVIF/WebP/JPG), overlay, badge e CTA principal.
- **Status do restaurante** — aberto/fechado em tempo real baseado no horário configurado.
- **Seção de diferenciais** — benefícios com cards responsivos.
- **Cardápio interativo** — grid de produtos com nome, descrição, preço e **"Pedir via WhatsApp"** por item (mensagem contextual).
- **Item indisponível** — badge "Indisponível" e botão desabilitado para itens fora de estoque.
- **Delivery (iFood / 99Food)** — cards com logo SVG, descrição, botão **Pedir** e QR Code dinâmico.
- **Avaliações** — carrossel de depoimentos com scroll horizontal e snap.
- **Programa de fidelidade** — selos visuais com contador em localStorage (demo).
- **Oferta com urgência** — destaque visual e **contador regressivo persistente por sessão**.
- **Vídeo de bastidores** — player nativo com poster.
- **Checkout (demo)** — simulação de PIX, cartão e boleto com máscaras de input.
- **Formulário de pedido** — nome (letras, mín. 3), telefone BR, endereço (mín. 10 chars), mensagem (5–500), checkboxes LGPD obrigatórios, **sanitização anti-XSS** e **rate limit** (3 envios/min) com fallback local quando IP indisponível.
- **Banner de cookies / LGPD** — Aceitar todos, Personalizar (Necessários / Analíticos / Marketing), Recusar; consentimento gravado com **timestamp, IP** e payload **criptografado** (AES-GCM) no navegador.
- **Páginas legais** — `politica-privacidade.html` (com todos os Arts. LGPD) e `termos-de-uso.html`.
- **Feedback visual** — erros por campo, erro geral de rate limit, toast de confirmação e status de sucesso.
- **Integração WhatsApp** — mensagem montada dinamicamente; links `wa.me`.
- **Sticky CTA mobile** — barra de ação fixa no mobile após 300px de scroll.
- **Botão flutuante** — WhatsApp posicionado acima do banner de cookies e sticky CTA.
- **Meta de segurança** — CSP, `X-Frame-Options: DENY`, `Referrer-Policy`.
- **Responsividade mobile-first** — header adaptável, menu toggle e grids fluidos (320px a 1440px+).
- **Animações leves** — fade-in ao rolar (Intersection Observer), respeitando `prefers-reduced-motion`.
- **SEO** — título, meta description, Schema.org Restaurant e markup semântico.
- **PWA** — instalável, cache offline com fallback para `offline.html`.

---

## Segurança e LGPD

### Medidas implementadas

| Área | Implementação |
|------|---------------|
| XSS | Sanitização multi-pass (`sanitizeInput`) antes de montar mensagem WhatsApp |
| Injeção | Remoção de `javascript:`, `data:`, `vbscript:`, `on*=`, path traversal |
| Rate limit | 3 envios/min por IP (fallback: ID de sessão local) + cooldown 30s |
| Formulário | Validação server-friendly: nome, telefone BR, endereço, mensagem |
| CSP | `script-src`, `img-src`, `connect-src` e `media-src` restritos |
| LGPD | Banner, modal de preferências, registro criptografado de consentimento |
| Tracking | GA4 / Meta Pixel / GTM condicionados ao consentimento armazenado |

### Limitações documentadas (ambiente estático)

> **Criptografia do consentimento:** a chave AES-256 é derivada de um literal estático presente no código-fonte. Isso oferece **integridade estrutural** ao registro, não confidencialidade real. Em produção, o registro de consentimento deve ser armazenado no servidor com chave privada gerenciada via HSM/KMS.

> **Rate limit client-side:** é uma camada de mitigação de UX, não uma barreira de segurança real. Em produção, valide no backend.

> **Fidelidade:** selos em `localStorage` sem assinatura — facilmente manipuláveis via DevTools. Integre com backend em produção.

---

## Preview

> Substitua os placeholders abaixo por capturas reais ao publicar o portfólio.

| Desktop | Mobile |
|---------|--------|
| ![Preview desktop](https://via.placeholder.com/640x360/141414/F5C518?text=Desktop+%E2%80%94+Chama+Burger) | ![Preview mobile](https://via.placeholder.com/320x568/0A0A0A/E50914?text=Mobile) |

**Sugestão de capturas:** hero completo, trecho do cardápio, formulário com validação e tela com timer da oferta.

---

## Como rodar o projeto

1. Clone ou baixe o repositório.
2. Abra o arquivo **`index.html`** no navegador (duplo clique ou "Open with Live Server" no VS Code).
3. **Configuração:** no arquivo **`js/config.js`**, ajuste:
   - `whatsappNumber` — somente dígitos com DDI/DDD (ex: `5571999999999`)
   - `ifoodLink` e `food99Link` — URLs reais das lojas nos apps
   - `ga4MeasurementId`, `metaPixelId`, `gtmId` — IDs reais de tracking (opcionais)

> Para **Web Crypto** (criptografia do consentimento) e **fetch do IP**, use **HTTPS** ou `localhost` — navegadores bloqueiam `crypto.subtle` em origens inseguras.

Não é necessário Node.js, build ou servidor — o projeto roda como site estático.

---

## Estrutura de arquivos

```
hamburgueria-2026/
├── index.html                    # Landing principal
├── 404.html                      # Página de erro
├── offline.html                  # Fallback PWA offline
├── politica-privacidade.html     # LGPD completo
├── termos-de-uso.html            # Termos legais
├── manifest.json                 # PWA manifest
├── sw.js                         # Service Worker com fallback offline
├── README.md
├── css/
│   ├── tokens.css               # Design system (cores, tipografia, espaçamento)
│   ├── main.css                 # Estilos base e layout
│   ├── components.css           # Componentes reutilizáveis
│   ├── responsive.css           # Media queries
│   └── lgpd.css                 # Banner e modal de cookies
├── js/
│   ├── config.js                # Configurações (WhatsApp, links, countdown)
│   ├── main.js                  # Lógica principal e UI
│   ├── lgpd.js                  # Consentimento e criptografia (AES-GCM)
│   ├── security.js              # Validação, sanitização, rate limit
│   ├── menu-dinamico.js         # Horário de funcionamento e estoque
│   ├── fidelidade.js            # Programa de fidelidade
│   ├── tracking.js              # Analytics condicional (LGPD)
│   └── pwa.js                   # Service Worker e instalação PWA
└── assets/
    ├── icons/                   # Ícones do projeto (icon.svg)
    └── images/                  # Imagens de produtos
```

---

## Estratégia de valor (portfólio)

Este repositório simula um **entregável comercial** típico de agência ou freelancer para PME: prazo curto, stack leve, custo de hospedagem zero e **impacto direto em pedidos**. Para recrutadores e clientes, o projeto evidencia:

- **Front-end** — semântica, CSS escalável com design tokens, JS modular em IIFE e preocupação com acessibilidade e performance.
- **Produto** — priorização de jornada, CTAs redundantes de forma intencional e hierarquia de informação.
- **Marketing digital** — copy e layout alinhados a conversão; integração com canal de venda real (WhatsApp).
- **Qualidade** — validação, sanitização, rate limit, LGPD, PWA, acessibilidade e SEO aplicados em projeto real.

---

## Autor

**Rebeca** — desenvolvimento front-end, UX/UI e visão de produto orientada a conversão.

---

<div align="center">

**Chama Burger** · Landing page focada em resultados · Portfólio profissional

</div>
