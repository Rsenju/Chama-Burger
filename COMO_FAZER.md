# COMO FAZER — Chama Burger

Guia prático para as tarefas mais comuns. Sem programação necessária nos itens marcados com 🟢.

---

## 🟢 Alterar número do WhatsApp

Abra `js/config.js` e mude a linha:

```js
whatsappNumber: "5571999999999",
```

Formato: `55` + DDD + número, somente dígitos. Exemplo: `5571998887766`.

---

## 🟢 Alterar links do iFood / 99Food

Abra `js/config.js`:

```js
ifoodLink: "https://www.ifood.com.br/delivery/sua-loja",
food99Link: "https://99food.com/sua-loja",
```

Os QR Codes são gerados automaticamente a partir dessas URLs.

---

## 🟢 Adicionar / editar item do cardápio

Abra `data/cardapio.json` e edite o array `itens`:

```json
{
  "id": "novo-burger",
  "nome": "Meu Novo Burger",
  "descricao": "Descrição apetitosa do hambúrguer.",
  "preco": "39.90",
  "foto": "novo-burger.jpg",
  "disponivel": true,
  "tags": []
}
```

- `id` — identificador único, sem espaços, use hífen
- `foto` — nome do arquivo em `assets/images/cardapio/`
- `disponivel` — `false` marca como indisponível automaticamente
- `tags` — use `["mais-vendido"]` para adicionar o badge amarelo

---

## 🟢 Marcar item como indisponível

Em `data/cardapio.json`, mude `"disponivel": true` para `"disponivel": false` no item desejado.

---

## 🟢 Adicionar foto real ao cardápio

1. Coloque o arquivo em `assets/images/cardapio/` (formatos aceitos: `.jpg`, `.png`, `.webp`, `.svg`)
2. Em `data/cardapio.json`, atualize o campo `"foto"` com o nome exato do arquivo
3. Proporção ideal: **4:3** (ex: 800×600px)

Se a foto não carregar, o sistema exibe automaticamente um placeholder cinza.

---

## 🟢 Alterar horário de funcionamento

Abra `js/menu-dinamico.js` e edite o array `SCHEDULE`:

```js
var SCHEDULE = [
  { open: "12:00", close: "22:00" }, // 0 = domingo
  { open: "11:00", close: "23:00" }, // 1 = segunda
  // ...
];
```

Use `null` para dias fechados: `null, // fechado`.

---

## 🟢 Alterar tempo do countdown de oferta

Abra `js/config.js`:

```js
countdownMinutes: 47,
```

Mude para quantos minutos quiser. O timer persiste na sessão do usuário.

---

## 🔵 Ativar Google Analytics (GA4)

Em `js/config.js`:

```js
ga4MeasurementId: "G-XXXXXXXXXX",
```

Só dispara após o usuário aceitar cookies analíticos no banner LGPD.

---

## 🔵 Ativar Meta Pixel

Em `js/config.js`:

```js
metaPixelId: "000000000000000",
```

Só dispara após o usuário aceitar cookies de marketing no banner LGPD.

---

## 🔵 Ativar Google Tag Manager

Em `js/config.js`:

```js
gtmId: "GTM-XXXXXXX",
```

Se preenchido, tem prioridade sobre GA4 direto (GTM gerencia ambos internamente).

---

## 🔵 Trocar vídeo de bastidores

Em `index.html`, localize a tag `<source>` dentro de `#video-promo` e substitua o `src`:

```html
<source src="URL_DO_SEU_VIDEO.mp4" type="video/mp4">
```

Formatos aceitos: `.mp4` (H.264 recomendado). Tamanho máximo recomendado: 50 MB.

---

## 🔵 Adicionar legenda ao vídeo

1. Crie o arquivo `assets/captions.vtt` no formato WebVTT
2. Em `index.html`, dentro do `<video>`, descomente:

```html
<track kind="captions" srclang="pt-BR" label="Português (Brasil)" src="assets/captions.vtt" default>
```

---

## 🔵 Atualizar versão da política de privacidade

Em `js/config.js`:

```js
policyVersion: "2026-04-14-v2",
```

Mude a data/versão. Isso invalida registros de consentimento anteriores, exibindo o banner novamente para todos os usuários.

---

## 🔵 Rodar o projeto localmente

O projeto exige um servidor HTTP por causa do `fetch()` para `data/cardapio.json`.

**Opção 1 — VS Code Live Server:**
Instale a extensão "Live Server" e clique em "Go Live".

**Opção 2 — Python:**
```bash
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

**Opção 3 — Node.js (npx, sem instalar):**
```bash
npx serve .
```

---

## ❌ O que NÃO fazer

- Não instalar npm / node_modules no projeto
- Não criar pastas fora da estrutura definida em `RULES.md`
- Não substituir `fetch()` por jQuery ou axios
- Não adicionar frameworks CSS (Bootstrap, Tailwind)
- Não editar `css/tokens.css` para mudanças pontuais — use variáveis existentes
