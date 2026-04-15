<div align="center">

# Chama Burger — Landing de Alta Conversão

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Landing page premium para hamburgueria — performance, UX e funil de pedidos integrado ao WhatsApp.**

[Como rodar](#-como-rodar-o-projeto) · [Funcionalidades](#-funcionalidades) · [Preview](#-preview)

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
| **UX** | Navegação clara, formulário com feedback de erro/sucesso, scroll suave, mobile-first e acessibilidade básica (landmarks, labels, skip link). |
| **Marketing** | Gatilhos de urgência e escassez, prova social, headline orientada a benefício e reforço de conversão no fechamento da página. |

Cenário simulado: restaurante real que precisa **captar pedidos pelo celular**, reduzir atrito na comunicação e **padronizar mensagens** enviadas à equipe no WhatsApp.

---

## Tecnologias utilizadas

- **HTML5** — estrutura semântica (`header`, `main`, `section`, `nav`, `footer`), headings hierárquicos e SEO básico (title, meta description).
- **CSS3** — layout responsivo **mobile-first**, variáveis CSS, tipografia web (Google Fonts), componentes reutilizáveis e estados de hover/foco.
- **JavaScript (ES5+)** — validação de formulário, montagem dinâmica de mensagens, contador de oferta, menu mobile, animação on-scroll e botão flutuante.
- **WhatsApp** — abertura de conversa com **mensagem pré-formatada** através da API pública de links: [`https://wa.me`](https://wa.me) (sem backend obrigatório).

---

## Funcionalidades

- **Hero de impacto** — imagem de fundo otimizada (URL), overlay para legibilidade e CTA principal.
- **Seção de diferenciais** — benefícios com ícones SVG e cards responsivos.
- **Cardápio interativo** — grid de produtos com nome, descrição, preço e **“Pedir via WhatsApp”** por item (mensagem contextual).
- **Prova social** — depoimentos com avaliação em estrelas e layout confiável.
- **Oferta com urgência** — destaque visual e **contador regressivo** (JavaScript).
- **Formulário de pedido/contato** — nome, telefone e mensagem com **validação completa** (campos vazios, telefone BR 10/11 dígitos).
- **Feedback visual** — classes de erro nos campos e mensagem de sucesso antes do disparo para o WhatsApp.
- **Integração WhatsApp** — função que **monta a mensagem dinamicamente** e abre o link com `encodeURIComponent`.
- **Botão flutuante** — acesso rápido ao WhatsApp em qualquer scroll.
- **Responsividade mobile-first** — header adaptável, menu toggle e grids fluidos.
- **Animações leves** — fade-in ao rolar (Intersection Observer), respeitando `prefers-reduced-motion`.
- **SEO básico** — título e meta description alinhados à proposta de valor.

---

## Foco e diferencial

Este projeto foi pensado com **mentalidade de produto digital**: cada bloco existe para **reduzir fricção** ou **aumentar intenção de pedido** — da headline ao rodapé. A estética (paleta escura, vermelho de ação, amarelo de atenção) serve ao objetivo de **guiar o olhar** e reforçar marca, sem competir com o funil de conversão.

Em **2026**, landing pages eficazes unem **performance**, **clareza** e **mensuração implícita** (eventos claros: clique em cardápio, envio de formulário, CTA flutuante). Aqui isso se materializa em HTML/CSS/JS enxutos, fáceis de hospedar em qualquer CDN ou GitHub Pages, e prontos para evoluir (pixels de rastreamento, testes A/B, CMS).

---

## Preview

> Substitua os placeholders abaixo por capturas reais ao publicar o portfólio (`docs/preview/` ou similar).

| Desktop | Mobile |
|---------|--------|
| ![Preview desktop](https://via.placeholder.com/640x360/141414/F5C518?text=Desktop+%E2%80%94+Chama+Burger) | ![Preview mobile](https://via.placeholder.com/320x568/0A0A0A/E50914?text=Mobile) |

**Sugestão de capturas:** hero completo, trecho do cardápio, formulário com validação e tela com timer da oferta.

---

## Como rodar o projeto

1. Clone ou baixe o repositório.
2. Abra o arquivo **`index.html`** no navegador (duplo clique ou “Open with Live Server”, se usar VS Code).
3. **WhatsApp:** no arquivo **`script.js`**, ajuste a constante **`WHATSAPP_NUMBER`** para o número real no formato internacional **somente dígitos** (ex.: `5511999999999`).

Não é necessário Node.js, build ou servidor — o projeto roda como site estático.

---

## Estratégia de valor (portfólio)

Este repositório simula um **entregável comercial** típico de agência ou freelancer para PME: prazo curto, stack leve, custo de hospedagem zero e **impacto direto em pedidos**. Para recrutadores e clientes, o projeto evidencia:

- **Front-end** — semântica, CSS escalável, JS modular em IIFE e preocupação com acessibilidade e performance.
- **Produto** — priorização de jornada, CTAs redundantes de forma intencional e hierarquia de informação.
- **Marketing digital** — copy e layout alinhados a conversão; integração com canal de venda real (WhatsApp).

É um case **explicável em entrevista** em poucos minutos: problema (converter visita em pedido), solução (landing + Zap), métrica sugerida (cliques em WA, taxa de envio do formulário).

---

## Estrutura de arquivos

```
Restaurante/
├── index.html    # Página e conteúdo semântico
├── style.css     # Estilos mobile-first
├── script.js     # Validação, WhatsApp, countdown, UX
└── README.md
```

---

## Autor

**Rebeca** — desenvolvimento front-end, UX/UI e visão de produto orientada a conversão.

---

<div align="center">

**Chama Burger** · Landing page focada em resultados · Portfólio profissional

</div>
