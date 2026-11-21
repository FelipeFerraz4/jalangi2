// Operações git da Fase 1: clonar/atualizar um projeto e conferir o arquivo de um commit contra o do pacote.
// Só lê objetos do git (clone, cat-file): nenhum código do projeto é executado nem baixado para fora da pasta do clone.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

// Nunca pergunta usuário/senha (um repositório apagado ou privado deve falhar, não travar o lote)
const GIT_ENV = Object.assign({}, process.env, { GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: 'true', GIT_LFS_SKIP_SMUDGE: '1' });

function git(args, options = {}) {
    return spawnSync('git', args, Object.assign({ env: GIT_ENV, encoding: 'buffer', maxBuffer: 256 * 1024 * 1024 }, options));
}

function gitAsync(args) {
    return new Promise(resolve => {
        const child = spawn('git', args, { env: GIT_ENV, stdio: ['ignore', 'ignore', 'pipe'] });
        let err = '';
        child.stderr.on('data', d => { err += d; });
        child.on('error', e => resolve({ status: -1, stderr: String(e) }));
        child.on('close', status => resolve({ status, stderr: err }));
    });
}

// Clona sem checkout (a árvore de trabalho é criada por merge, na Fase 2). Se já existe, só busca com `update`.
// Devolve { ok, action: 'clone'|'fetch'|'existente', error }
async function ensureClone(url, dir, { update = false } = {}) {
    if (fs.existsSync(path.join(dir, 'HEAD')) || fs.existsSync(path.join(dir, '.git'))) {
        if (!update) return { ok: true, action: 'existente' };
        const r = await gitAsync(['-C', dir, 'fetch', '--quiet', '--all', '--tags']);
        return r.status === 0 ? { ok: true, action: 'fetch' } : { ok: false, action: 'fetch', error: r.stderr.trim().split('\n').slice(-1)[0] };
    }
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    const r = await gitAsync(['clone', '--quiet', '--no-checkout', url, dir]);
    if (r.status === 0) return { ok: true, action: 'clone' };
    fs.rmSync(dir, { recursive: true, force: true });   // não deixa clone pela metade
    return { ok: false, action: 'clone', error: r.stderr.trim().split('\n').slice(-1)[0] };
}

const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

// Confere o arquivo `file` no commit `commit` contra o conteúdo esperado (merge.js do pacote).
// Estados: ok | commit_ausente | arquivo_ausente | conteudo_diferente
function verifyFile(dir, commit, file, expectedSha) {
    const has = git(['-C', dir, 'cat-file', '-e', commit + '^{commit}']);
    if (has.status !== 0) return { status: 'commit_ausente' };
    const blob = git(['-C', dir, 'cat-file', 'blob', commit + ':' + file]);
    if (blob.status !== 0) return { status: 'arquivo_ausente' };
    const actual = sha256(blob.stdout);
    return actual === expectedSha ? { status: 'ok', sha256: actual } : { status: 'conteudo_diferente', sha256: actual };
}

module.exports = { ensureClone, verifyFile, sha256, git };
