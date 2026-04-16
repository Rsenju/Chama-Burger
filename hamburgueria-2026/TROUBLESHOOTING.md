# TROUBLESHOOTING — Chama Burger

Problemas comuns e como resolvê-los. Consulte antes de abrir chamado.

---

## Cardápio não aparece / grid vazio

**Causa mais comum:** arquivo aberto diretamente via `file://` (duplo clique no HTML).  
`fetch()` não funciona sem servidor HTTP.

**Solução:**
```bash
python3 -m http.server 8080
# Acesse http://localhost:8080
```
Veja `COMO_FAZER.md` para outras opções de servidor local.

**Causa alternativa:** erro de sintaxe em `data/cardapio.json`.  
**Solução:** cole o conteúdo em [jsonlint.com](https://jsonlint.com) e corrija os erros.

---

## Botão "Pedir via WhatsApp" não abre nada

**Causa 1:** número inválido em `js/config.js`.  
**Solução:** confirme que `whatsappNumber` contém só dígitos, com `55` + DDD + número (13 dígitos para celular).

**Causa 2:** popup bloqueado pelo navegador.  
**Solução:** permitir popups para o domínio do site nas configurações do navegador.

---

## QR Code do iFood / 99Food não aparece

**Causa:** URL configurada é inválida ou o serviço `api.qrserver.com` está inacessível.  
**Solução:** confirme as URLs em `js/config.js` e verifique conexão com a internet.

---

## Banner LGPD aparece toda vez que recarrego

**Causa mais comum:** `localStorage` bloqueado ou em modo privado (incógnito).  
**Causa alternativa:** `policyVersion` foi alterado em `js/config.js` — isso invalida consentimentos anteriores intencionalmente.  
**Solução (desenvolvimento):** abra DevTools → Application → Local Storage → delete as chaves `chama_lgpd_*`.

---

## Formulário travado com "Formulário indisponível"

**Causa:** `js/security.js` não carregou (erro de script anterior impediu execução).  
**Solução:** abra DevTools → Console e verifique erros de JavaScript. Corrija o erro reportado e recarregue.

---

## Countdown reinicia toda vez

**Causa:** modo privado ou `sessionStorage` bloqueado.  
**Comportamento esperado:** em sessão normal, o countdown persiste enquanto a aba estiver aberta.

---

## Rate limit ativado sem ter enviado 3 pedidos

**Causa:** múltiplas abas abertas compartilham o mesmo `localStorage`.  
**Solução (desenvolvimento):** DevTools → Application → Local Storage → delete chaves `chama_rate_*`.

---

## Imagem do cardápio não carrega (aparece placeholder cinza)

**Causa:** arquivo não existe em `assets/images/cardapio/` ou nome diferente do campo `"foto"` no JSON.  
**Solução:**
1. Confirme o nome exato do arquivo (case-sensitive em servidores Linux)
2. Confirme que `"foto"` no JSON bate exatamente com o nome do arquivo
3. Extensões testadas automaticamente em ordem: `.jpg → .png → .webp → .svg`

---

## Logo iFood / 99Food não aparece

**Causa:** arquivos `assets/logos/ifood.svg` ou `assets/logos/99food.svg` ausentes.  
**Solução:** verifique se os arquivos existem no caminho correto. Eles são SVG — podem ser abertos no navegador diretamente para confirmar.

---

## Status do restaurante sempre "Fechado"

**Causa:** horários em `js/menu-dinamico.js` não refletem o fuso local do servidor/cliente.  
**Solução:** ajuste o array `SCHEDULE` em `menu-dinamico.js` para os horários reais. O status usa `new Date()` do dispositivo do usuário.

---

## Service Worker em cache desatualizado

**Sintoma:** mudanças no CSS/JS não aparecem mesmo após salvar.  
**Solução:**
1. DevTools → Application → Service Workers → "Update" ou "Unregister"
2. Mude a versão `CACHE_NAME` em `sw.js` (ex: `chama-burger-v2026-2`) para forçar novo cache

---

## Criptografia do consentimento falha (modo HTTP)

**Causa:** `crypto.subtle` só funciona em HTTPS ou `localhost`.  
**Comportamento:** cai automaticamente para fallback Base64 — consentimento ainda é salvo, sem criptografia AES.  
**Solução em produção:** servir o site via HTTPS (obrigatório para PWA e crypto).

---

## PWA não instala (botão "Instalar app" não aparece)

**Causas comuns:**
- Site não está em HTTPS
- `manifest.json` com erro de sintaxe
- Service Worker não registrado
- Navegador não suporta PWA (Firefox desktop tem suporte limitado)

**Verificação:** DevTools → Application → Manifest e Application → Service Workers.

---

## `api.ipify.org` bloqueado / rate limit de IP

**Causa:** rede corporativa ou firewall bloqueia a API externa de IP.  
**Comportamento:** sistema cai automaticamente para identificador de sessão local — rate limit ainda funciona na sessão.  
**Impacto:** sem IP real no registro de consentimento LGPD (aparece como `"indisponível"`).

---

## Erro genérico no console: "Cannot read properties of undefined"

**Causa mais comum:** um `<script>` falhou antes de `main.js` ser carregado.  
**Solução:**
1. DevTools → Console → clique no link do erro para ver o arquivo/linha
2. Corrija o erro no arquivo indicado
3. Recarregue a página

---

## Contato para suporte técnico

Se o problema persistir após consultar este guia:  
📧 `dpo@chamaburger.com.br`  
Inclua: descrição do problema, navegador, sistema operacional e screenshot do Console (DevTools).