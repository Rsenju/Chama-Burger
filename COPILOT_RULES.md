## 📄 Arquivo: `COPILOT_RULES.md`

# REGRAS DE EXECUÇÃO — COPILOT CHAMA BURGER

## Contexto do Projeto
- Nome: Chama Burger
- Stack: HTML5, CSS3, JavaScript vanilla (ES6+)
- Banco de dados: SheetDB (REST API)
- PWA: Service Worker, manifest.json
- Objetivo: Landing page de alta conversão para hamburgueria

## Estrutura de Pastas (SAGRADA — não criar novas)

```markdown
hamburgueria-2026/
├── index.html                    # Landing principal
├── 404.html                      # Página de erro (CSS corrigido)
├── offline.html                  # Fallback PWA offline
├── politica-privacidade.html     # LGPD completo
├── termos-de-uso.html            # Termos legais
├── manifest.json                 # PWA manifest (ícones separados por purpose)
├── sw.js                         # Service Worker (fallback offline adicionado)
├── data/
│   └── cardapio.json            # NOVO — todos os itens do cardápio
├── css/
│   ├── tokens.css               # Design system
│   ├── main.css                 # Estilos base (@import removido)
│   ├── components.css           # Componentes (z-index nav-mobile, cardápio, delivery)
│   ├── responsive.css           # Media queries
│   └── lgpd.css                 # Banner/modal cookies
├── js/
│   ├── config.js                # Configurações
│   ├── main.js                  # Lógica principal (form disabled, countdown sessionStorage)
│   ├── lgpd.js                  # Consentimento (comentário limitação criptográfica)
│   ├── security.js              # Validação (fallback rate limit sem IP)
│   ├── menu-dinamico.js         # Horário e estoque
│   ├── fidelidade.js            # Programa de fidelidade
│   ├── tracking.js              # Analytics condicional
│   ├── pwa.js                   # Service Worker
│   └── cardapio-loader.js       # lê JSON e renderiza cards
├── assets/
│   ├── icons/                   # Ícones SVG
│   ├── images/
│   │   └── cardapio/            
│   └── logos/                   
│       ├── ifood.svg            
│       └── 99food.svg           
├── README.md                    # Atualizado (estrutura + segurança/LGPD)
├── CHANGELOG.md                 
├── DECISIONS.md                 
├── COMO_FAZER.md                
└── TROUBLESHOOTING.md           
```

## Regras de Criação de Arquivos

| Ação | Permissão | Exemplo |
|------|-----------|---------|
| Criar `.js` em `js/` | ✅ Permitido | `js/cadastro-vip.js` |
| Criar `.css` em `css/` | ✅ Permitido | `css/modal-cadastro.css` |
| Criar `.json` em `data/` | ✅ Permitido | `data/clientes-vip.json` |
| Criar `.md` na raiz | ✅ Permitido | `CHANGELOG.md` |
| Criar imagens em `assets/` | ✅ Permitido | `assets/images/cardapio/novo.webp` |
| Criar NOVAS pastas | ❌ PROIBIDO | `src/`, `utils/`, `components/` |
| Criar fora da estrutura | ❌ PROIBIDO | `script.js` na raiz |

## Regras de Stack (INQUEBRÁVEIS)

- ✅ Manter: HTML/CSS/JS vanilla
- ✅ Manter: SheetDB (não migrar)
- ✅ Manter: `fetch()` nativo (não instalar axios)
- ❌ PROIBIDO: npm, yarn, node_modules
- ❌ PROIBIDO: React, Vue, Angular, Svelte
- ❌ PROIBIDO: TypeScript
- ❌ PROIBIDO: Bootstrap, Tailwind (usar CSS próprio)
- ❌ PROIBIDO: jQuery

## Regras de Alteração

| Ação | Permissão |
|------|-----------|
| Modificar arquivos do prompt | ✅ Sim |
| Adicionar `<script>` em `index.html` | ✅ Sim (para carregar novos JS) |
| Adicionar `<link>` em `index.html` | ✅ Sim (para carregar novos CSS) |
| Deletar arquivos existentes | ❌ Não |
| Renomear arquivos existentes | ❌ Não |
| Mudar estrutura de dados JSON existente | ❌ Não (sem compatibilidade) |

## Regras de Execução

1. **Siga o prompt literalmente**
2. **Ambiguidade = interpretação conservadora** (menos código, não mais)
3. **Máximo 3 tentativas por erro**, depois pare
4. **Reutilize código existente** antes de criar novo
5. **Mantenha padrões do projeto** (nomenclatura, indentação, comentários)

## Quando Parar (Reportar erro, aguardar)

- Erro envolve autenticação complexa (OAuth, JWT)
- Erro envolve pagamento (PIX, cartão, gateway)
- Erro envolve criptografia de dados sensíveis
- Loop de erro após 3 tentativas
- Necessidade de criar nova pasta (estrutura)

## Formato de Reporte de Erro

```
ERRO: [descrição em 1 linha]
ARQUIVO: [caminho]
TENTATIVAS: [N/3]
SUGESTÃO: [sua ideia de solução, opcional]
```

## Checklist Pré-Execução (Copilot deve verificar)

- [ ] Prompt especifica arquivos a modificar?
- [ ] Solução cabe dentro da estrutura existente?
- [ ] Não viola regras de stack?
- [ ] Não requer nova pasta?
- [ ] Se criar arquivo, extensão e pasta estão corretas?

---

Última atualização: 2026-04-16
Versão: 1.0