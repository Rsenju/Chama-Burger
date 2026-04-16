#!/usr/bin/env node
/**
 * Atualizador automático de documentação Chama Burger
 * Versão: 1.0.0
 * Uso: node scripts/update-docs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ==================== CONFIGURAÇÃO ====================
const CONFIG = {
    arquivos: {
        changelog: 'CHANGELOG.md',
        decisions: 'DECISIONS.md',
        comoFazer: 'COMO_FAZER.md',
        troubleshooting: 'TROUBLESHOOTING.md'
    },
    backup: true,
    verbose: true
};

// ==================== VALIDAÇÕES ====================
function validarAmbiente() {
    const raiz = process.cwd();
    
    // Verifica se está na pasta correta
    if (!fs.existsSync(path.join(raiz, 'index.html'))) {
        throw new Error('❌ Execute na raiz do projeto (onde está index.html)');
    }
    
    if (!fs.existsSync(path.join(raiz, '.git'))) {
        throw new Error('❌ Repositório Git não encontrado');
    }
    
    if (!fs.existsSync(path.join(raiz, 'scripts'))) {
        throw new Error('❌ Pasta scripts/ não existe. Crie: mkdir scripts');
    }
    
    console.log('✅ Ambiente validado');
}

// ==================== FUNÇÕES UTILITÁRIAS ====================
function executarGit(args) {
    try {
        return execSync(`git ${args}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } catch (err) {
        throw new Error(`Git falhou: ${err.message}`);
    }
}

function formatarData(data = new Date()) {
    return data.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatarHora(data = new Date()) {
    return data.toTimeString().split(' ')[0]; // HH:MM:SS
}

function garantirArquivoExiste(caminho, conteudoInicial = '') {
    if (!fs.existsSync(caminho)) {
        fs.writeFileSync(caminho, conteudoInicial, 'utf-8');
        console.log(`📝 Criado: ${path.basename(caminho)}`);
    }
}

function criarBackup(caminho) {
    if (!CONFIG.backup) return;
    
    const ext = path.extname(caminho);
    const base = path.basename(caminho, ext);
    const backup = `${base}.backup-${formatarData()}-${Date.now()}${ext}`;
    const dir = path.dirname(caminho);
    
    fs.copyFileSync(caminho, path.join(dir, backup));
    console.log(`💾 Backup: ${backup}`);
}

// ==================== ATUALIZADORES ====================
function atualizarChangelog() {
    const caminho = CONFIG.arquivos.changelog;
    
    garantirArquivoExiste(caminho, '# Changelog\n\nRegistro de mudanças do projeto Chama Burger.\n');
    criarBackup(caminho);
    
    // Pega último commit
    const hash = executarGit('log -1 --pretty=format:%h');
    const mensagem = executarGit('log -1 --pretty=format:%s');
    const data = formatarData();
    const hora = formatarHora();
    
    const entrada = `
## [${data}] - ${hash}
**Hora:** ${hora}

- ${mensagem}

**Arquivos modificados:**
${executarGit('diff --name-only HEAD~1 HEAD').split('\n').map(f => `- ${f}`).join('\n') || '- Sem arquivos modificados'}

---
`;
    
    fs.appendFileSync(caminho, entrada, 'utf-8');
    console.log(`✅ ${path.basename(caminho)} atualizado`);
}

function atualizarDecisions() {
    const caminho = CONFIG.arquivos.decisions;
    
    garantirArquivoExiste(caminho, '# Decisões do Projeto\n\nRegistro de decisões técnicas e arquiteturais.\n');
    criarBackup(caminho);
    
    // Só adiciona se houver mensagem de commit indicando decisão
    const mensagem = executarGit('log -1 --pretty=format:%s').toLowerCase();
    if (mensagem.includes('decisão') || mensagem.includes('decisao') || mensagem.includes('escolha')) {
        const entrada = `
## ${formatarData()}
**Decisão:** ${executarGit('log -1 --pretty=format:%s')}

**Contexto:** [Preencher manualmente]

**Alternativas consideradas:**
- [Preencher]

**Escolha:** ${executarGit('log -1 --pretty=format:%s')}

**Consequências:** [Preencher]

---
`;
        fs.appendFileSync(caminho, entrada, 'utf-8');
        console.log(`✅ ${path.basename(caminho)} atualizado (decisão detectada)`);
    } else {
        console.log(`⏭️  ${path.basename(caminho)} - nenhuma decisão detectada no commit`);
    }
}

function atualizarComoFazer() {
    const caminho = CONFIG.arquivos.comoFazer;
    
    garantirArquivoExiste(caminho, '# Como Fazer\n\nTutoriais rápidos para operações comuns.\n');
    criarBackup(caminho);
    
    // Só adiciona se houver mensagem indicando tutorial
    const mensagem = executarGit('log -1 --pretty=format:%s').toLowerCase();
    if (mensagem.includes('como') || mensagem.includes('tutorial') || mensagem.includes('passo')) {
        const entrada = `
## ${executarGit('log -1 --pretty=format:%s')}

**Data:** ${formatarData()}

**Passos:**
1. [Preencher]
2. [Preencher]
3. [Preencher]

**Verificação:** [Como confirmar que deu certo]

**Problemas comuns:**
- [Erro X]: [Solução]

---
`;
        fs.appendFileSync(caminho, entrada, 'utf-8');
        console.log(`✅ ${path.basename(caminho)} atualizado (tutorial detectado)`);
    } else {
        console.log(`⏭️  ${path.basename(caminho)} - nenhum tutorial detectado no commit`);
    }
}

function atualizarTroubleshooting() {
    const caminho = CONFIG.arquivos.troubleshooting;
    
    garantirArquivoExiste(caminho, '# Troubleshooting\n\nProblemas encontrados e soluções.\n');
    criarBackup(caminho);
    
    // Só adiciona se houver mensagem indicando erro/correção
    const mensagem = executarGit('log -1 --pretty=format:%s').toLowerCase();
    if (mensagem.includes('fix') || mensagem.includes('corrigir') || mensagem.includes('erro') || mensagem.includes('bug')) {
        const entrada = `
## ${formatarData()} - ${executarGit('log -1 --pretty=format:%s')}

**Sintoma:** [O que acontecia]

**Causa:** [Por que acontecia]

**Solução:** [Como resolveu]

**Prevenção:** [Como evitar no futuro]

**Arquivos envolvidos:** ${executarGit('diff --name-only HEAD~1 HEAD') || 'N/A'}

---
`;
        fs.appendFileSync(caminho, entrada, 'utf-8');
        console.log(`✅ ${path.basename(caminho)} atualizado (fix detectado)`);
    } else {
        console.log(`⏭️  ${path.basename(caminho)} - nenhum fix detectado no commit`);
    }
}

// ==================== EXECUÇÃO PRINCIPAL ====================
function main() {
    console.log('='.repeat(50));
    console.log('📚 Atualizador de Documentação Chama Burger');
    console.log('='.repeat(50));
    
    try {
        validarAmbiente();
        
        console.log(`\n📅 Data: ${formatarData()}`);
        console.log(`⏰ Hora: ${formatarHora()}`);
        console.log(`📌 Commit: ${executarGit('log -1 --pretty=format:%h - %s')}\n`);
        
        atualizarChangelog();
        atualizarDecisions();
        atualizarComoFazer();
        atualizarTroubleshooting();
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ Documentação atualizada com sucesso');
        console.log('='.repeat(50));
        
    } catch (err) {
        console.error('\n❌ ERRO:', err.message);
        console.log('\n💡 Dica: Verifique se está na pasta raiz do projeto');
        process.exit(1);
    }
}

main();