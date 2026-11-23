// Gera as pastas da análise manual: uma por amostra com conflito no lote, com tudo o que é preciso para
// julgar o caso sem rodar nada.
//
//   analise-manual/casos/<Cnn>-<projeto>-<merge8>/
//     README.md      o caso: merge, arquivo, como foi executado, conflitos agrupados por par de linhas
//                    (com o código de L, R e base e a pilha de chamadas) e grupo
//     base.js left.js right.js merge.js   as quatro versões do arquivo (ancestral, pais e merge)
//     diff_left.diff diff_right.diff      base → left e base → right
//   analise-manual/casos.json             metadados de todos os casos (usado pela planilha)
//
// Grupos (ordem de prioridade da inspeção):
//   A  conflito direto (ou OA) e Left e Right alteraram a mesma função (Newminerjs): candidato mais forte
//   B  conflito direto, em funções diferentes ou sem correspondência estática: interferência indireta
//   C  só conflitos transitivos, ou arquivo gerado/minificado: suspeito de falso positivo
// A análise manual é feita por conflito: a planilha sorteia um conflito de cada caso (aba "Conflitos sorteados").
//
// Uso: node experiments/results/gerar_casos.js [--wild ~/Documentos/wild] [--run lote]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { readCsv } = require('../wild/lib/csv');
const { buildLineMap } = require('../tools/line-map');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const W = opt('--wild', process.env.WILD_HOME || path.join(os.homedir(), 'Documentos', 'wild'));
const RUN = path.join(W, 'execucoes', opt('--run', 'lote'));
const OUT = path.join(__dirname, 'analise-manual');
const GENERATED = /(^|\/)(dist|build|out|vendor)\/|\.min\.js$|(^|\/)bundle/;
const n = x => parseInt(x || '0', 10) || 0;

const git = (repo, ...a) => { try { return execFileSync('git', ['-C', repo, ...a], { encoding: 'utf-8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return null; } };

function groupOf(r, conflicts, sameFn) {
    const strong = conflicts.some(c => c.natureza === 'direto' || c.tipo === 'OA');
    if (!strong || GENERATED.test(r.arquivo)) return 'C';
    return sameFn === 'Sim' ? 'A' : 'B';
}

// Direção de cada registro, a partir da chave (o CSV só traz a linha de L e a de R):
//   DF  "L@arq:43->R@arq:149"     de quem produz para quem consome
//   OA  "alvo|arq:446|arq:89"      a primeira escrita sobrescreveu a segunda
//   CF  "arq:L|arq:R@arq:base"     L e R confluem num comando da base
function direction(k) {
    const L = n(k.L_linha), R = n(k.R_linha);
    if (k.tipo === 'DF') {
        const m = k.chave.match(/^(L|R)@.*:(\d+)->(L|R)@.*:(\d+)$/);
        if (m) return { first: m[1], firstLine: +m[2], second: m[3], secondLine: +m[4] };
    }
    if (k.tipo === 'OA') {
        const parts = k.chave.split('|');
        const over = n((parts[parts.length - 2] || '').split(':').pop());
        if (over === L) return { first: 'L', firstLine: L, second: 'R', secondLine: R };
        if (over === R) return { first: 'R', firstLine: R, second: 'L', secondLine: L };
    }
    return { first: 'L', firstLine: L, second: 'R', secondLine: R };
}
const VERB = { DF: ['produz', 'consome'], OA: ['sobrescreve', 'foi sobrescrita'], CF: ['', ''] };

// merge_anotado.js: o merge.js com um comentário no fim de cada linha que importa (a numeração não muda):
//   [L] [R]        linha alterada por aquele lado (mapa usado na execução)
//   [L=R]          linha igual nos dois lados (o mapa conta como L)
//   ◀ #n papel     papel da linha no conflito n do README (produz, consome, sobrescreve, ...), e de onde veio a
//                  branch quando a linha não foi alterada por aquele lado (chamada numa linha alterada, ou comando de
//                  várias linhas)
function writeAnnotated(dir, r, m, pairs, mergeLines) {
    let map = {};
    try { map = JSON.parse(fs.readFileSync(path.join(W, 'dados', 'maps', 'por-merge', `${r.projeto}__${m.merge_commit}.json`), 'utf-8')).files[r.arquivo] || {}; } catch (e) { }
    let both = new Set();
    try {
        const f = k => path.join(dir, k + '.js');
        both = new Set(buildLineMap({ base: f('base'), left: f('left'), right: f('right'), merge: f('merge') }).bothLines);
    } catch (e) { }
    const notes = new Map();
    const add = (ln, text) => { if (!ln) return; (notes.get(ln) || notes.set(ln, []).get(ln)).push(text); };
    const origin = (ln, branch, stack) => {
        if (both.has(ln)) return ' (linha igual nos dois lados: o mapa conta como L)';
        if (map[ln] === branch) return '';
        const via = (stack || []).filter(l => l !== ln && map[l] === branch);
        if (via.length) return ` (herdou ${branch} pela chamada na linha ${via[via.length - 1]})`;
        return ` (linha não alterada por ${branch}: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [${branch}] mais próxima no merge_anotado.js)`;
    };
    pairs.forEach((g, i) => {
        const n_ = `#${i + 1} ${g.tipo}`;
        g.origem = g.tipo === 'CF'
            ? { L: origin(g.L, 'L', g.stack).trim(), R: origin(g.R, 'R', g.stack).trim() }
            : { [g.first + g.firstLine]: origin(g.firstLine, g.first, g.stack).trim(), [g.second + g.secondLine]: origin(g.secondLine, g.second, g.stack).trim() };
        if (g.tipo === 'CF') {
            add(g.L, `◀ ${n_}: valor de L${origin(g.L, 'L', g.stack)}`);
            add(g.R, `◀ ${n_}: valor de R${origin(g.R, 'R', g.stack)}`);
            add(g.base, `◀ ${n_}: confluência (L ${g.L} + R ${g.R})`);
        } else {
            add(g.firstLine, `◀ ${n_}: ${VERB[g.tipo][0]} (${g.first})${origin(g.firstLine, g.first, g.stack)} → ${g.second} ${g.secondLine}`);
            add(g.secondLine, `◀ ${n_}: ${VERB[g.tipo][1]} (${g.second})${origin(g.secondLine, g.second, g.stack)} ← ${g.first} ${g.firstLine}`);
        }
    });
    const width = Math.min(100, Math.max(40, ...mergeLines.map(l => l.length).filter(x => x <= 100)));
    const out = mergeLines.map((line, i) => {
        const ln = i + 1;
        const tag = both.has(ln) ? '[L=R]' : map[ln] ? `[${map[ln]}]` : '';
        const extra = notes.get(ln) || [];
        if (!tag && !extra.length) return line;
        const roles = extra.length > 3 ? [...extra.slice(0, 3), `… (+${extra.length - 3} conflitos nesta linha)`] : extra;
        return (line.length < width ? line.padEnd(width) : line) + '  // ' + [tag, ...roles].filter(Boolean).join('  ');
    });
    if (out.length && out[out.length - 1] === '') out.pop();
    out.push('', '// ─────────────────────────────────────────────────────────────────────────────',
        '// Legenda (merge_anotado.js; a numeração das linhas é a mesma do merge.js e do README):',
        '//   [L] / [R]   linha alterada por aquele lado        [L=R]  igual nos dois lados (o mapa conta como L)',
        '//   ◀ #n        papel da linha no conflito n do README.md; "herdou" = a linha não foi alterada por aquele',
        '//               lado e pegou a branch da chamada indicada (regra interprocedural da análise)');
    fs.writeFileSync(path.join(dir, 'merge_anotado.js'), out.join('\n') + '\n');
}

function codeAt(lines, ln) { const s = lines[ln - 1]; return s === undefined ? '' : s.trim().slice(0, 160); }

function main() {
    const manifest = new Map(readCsv(path.join(W, 'dados', 'manifesto.csv')).map(m => [m.sample_id, m]));
    const results = readCsv(path.join(RUN, 'resultados.csv'), ';');
    const conflicts = readCsv(path.join(RUN, 'conflitos.csv'), ';');
    const crossFile = path.join(RUN, 'cruzamento_newminerjs.csv');
    const cross = fs.existsSync(crossFile) ? new Map(readCsv(crossFile, ';').map(c => [c.sample_id, c])) : new Map();

    const byId = new Map();
    for (const c of conflicts) (byId.get(c.sample_id) || byId.set(c.sample_id, []).get(c.sample_id)).push(c);
    const order = { A: 0, B: 1, C: 2 };
    const cases = results.filter(r => n(r.OA) + n(r.DF) + n(r.CF) > 0).map(r => {
        const cs = byId.get(r.sample_id) || [];
        const x = cross.get(r.sample_id) || {};
        return { r, cs, x, grupo: groupOf(r, cs, x.mesma_funcao) };
    }).sort((a, b) => order[a.grupo] - order[b.grupo] || (a.r.projeto < b.r.projeto ? -1 : a.r.projeto > b.r.projeto ? 1 : 0) || b.cs.length - a.cs.length);
    cases.forEach((c, i) => { c.id = 'C' + String(i + 1).padStart(2, '0'); });

    fs.rmSync(path.join(OUT, 'casos'), { recursive: true, force: true });
    const meta = [];
    for (const c of cases) {
        const { r, cs, x } = c;
        const m = manifest.get(r.sample_id);
        const repo = path.join(W, 'repos', r.projeto);
        const short = r.projeto.split('__')[1];
        const dir = path.join(OUT, 'casos', `${c.id}-${short}-${r.merge_commit.slice(0, 8)}`);
        fs.mkdirSync(dir, { recursive: true });
        const versions = { base: m.ancestor_commit, left: m.left_commit, right: m.right_commit, merge: m.merge_commit };
        const text = {};
        for (const [k, sha] of Object.entries(versions)) {
            text[k] = git(repo, 'show', `${sha}:${r.arquivo}`);
            if (text[k] !== null) fs.writeFileSync(path.join(dir, `${k}.js`), text[k]);
        }
        for (const side of ['left', 'right']) {
            const d = git(repo, 'diff', '--no-color', '-U5', versions.base, versions[side], '--', r.arquivo);
            if (d !== null) fs.writeFileSync(path.join(dir, `diff_${side}.diff`), d);
        }
        const mergeLines = (text.merge || '').split('\n');
        let metaRun = {};
        try { metaRun = JSON.parse(fs.readFileSync(path.join(RUN, 'amostras', r.sample_id, 'meta.json'), 'utf-8')); } catch (e) { }
        let report = null;
        try { report = JSON.parse(fs.readFileSync(path.join(RUN, 'amostras', r.sample_id, 'report.json'), 'utf-8')); } catch (e) { }
        const stacks = new Map();
        if (report) for (const kind of ['oa', 'df', 'cf']) for (const k of report.conflicts[kind] || []) stacks.set(`${kind}|${k.key}`, k.stack || []);

        // Agrupa os registros por (tipo, linha L, linha R, linha da base)
        const groups = new Map();
        for (const k of cs) {
            const d = direction(k);
            const key = [k.tipo, d.first, d.firstLine, d.second, d.secondLine, k.linha_base].join('|');
            const g = groups.get(key) || Object.assign({ tipo: k.tipo, L: n(k.L_linha), R: n(k.R_linha), base: n(k.linha_base), naturezas: new Set(), alvos: new Set(), viaParam: 0, registros: 0, chaves: [] }, d);
            g.chaves.push(k.chave);
            g.registros++; if (k.natureza) g.naturezas.add(k.natureza); if (k.via_parametro === 'sim') g.viaParam++;
            for (const a of (k.alvo || '').split(/\s+/).filter(Boolean)) g.alvos.add(a);
            groups.set(key, g);
        }
        const pairs = [...groups.values()].sort((a, b) => a.firstLine - b.firstLine || a.secondLine - b.secondLine);
        const title = g => g.tipo === 'CF'
            ? `L ${g.L} e R ${g.R} confluem na base ${g.base}`
            : `${g.first} ${g.firstLine} ${VERB[g.tipo][0]} → ${g.second} ${g.secondLine} ${VERB[g.tipo][1]}`;
        const short_ = g => g.tipo === 'CF' ? `CF L${g.L}+R${g.R}→B${g.base}` : `${g.tipo} ${g.first}${g.firstLine}→${g.second}${g.secondLine}`;
        const testCmd = (metaRun.run && metaRun.run.testCommand) || r.comando_testes || '';
        const url = (m.repo_url || '').replace(/\.git$/, '');
        const md = [];
        md.push(`# ${c.id}: ${short}, \`${r.arquivo}\``, '');
        md.push(`| | |`, `|---|---|`);
        md.push(`| Grupo | **${c.grupo}** (${{ A: 'conflito direto, mesma função', B: 'conflito direto, funções diferentes ou sem correspondência', C: 'só transitivo ou arquivo gerado: suspeito' }[c.grupo]}) |`);
        md.push(`| Projeto | [${r.projeto}](${url}) |`);
        md.push(`| Merge | [\`${m.merge_commit.slice(0, 10)}\`](${url}/commit/${m.merge_commit}) (${m.merge_date}) |`);
        md.push(`| Base / Left / Right | [\`${m.ancestor_commit.slice(0, 8)}\`](${url}/blob/${m.ancestor_commit}/${r.arquivo}) / [\`${m.left_commit.slice(0, 8)}\`](${url}/blob/${m.left_commit}/${r.arquivo}) / [\`${m.right_commit.slice(0, 8)}\`](${url}/blob/${m.right_commit}/${r.arquivo}) |`);
        md.push(`| Linhas alteradas no merge | L ${r.linhas_L}, R ${r.linhas_R}; executadas L ${r.L_executadas}/${r.L_total}, R ${r.R_executadas}/${r.R_total} |`);
        md.push(`| Como executou | ${r.modo === 'testes' ? `suíte de testes do projeto: \`${testCmd}\`` : 'carregando só o arquivo (`node merge.js`)'} |`);
        md.push(`| Detectado | OA ${n(r.OA)}, DF ${n(r.DF)}, CF ${n(r.CF)} (${cs.length} registros em ${pairs.length} pares de linhas) |`);
        md.push(`| Newminerjs (mesma função?) | ${x.mesma_funcao_detalhe || '—'}${x.funcoes_em_comum && x.funcoes_em_comum !== 'Nenhuma identificada' ? `: ${x.funcoes_em_comum}` : ''} |`);
        md.push('', 'Como ler: **DF** a linha de um lado produz um valor que a linha do outro lado consome; **OA** a escrita de um lado sobrescreve a do outro com valor diferente; **CF** valores de L e de R se encontram num comando da base. *Direto*: o valor vai da escrita ao uso sem passar por outros valores; *transitivo*: passa (x → y → uso); *via parâmetro*: entrou numa função por parâmetro (mais sujeito a falso positivo).');
        md.push('', 'Arquivos: `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou em relação à base. **As linhas abaixo são do `merge.js`**, que é a versão executada. **`merge_anotado.js`** é o mesmo `merge.js` com `// [L]`, `// [R]` e a participação em cada conflito no fim das linhas (a numeração não muda; legenda no fim do arquivo).', '');
        md.push('## Conflitos (por par de linhas)', '');
        for (const [i, g] of pairs.entries()) {
            md.push(`### ${i + 1}. ${g.tipo}${g.naturezas.size ? ' ' + [...g.naturezas].join('/') : ''}: ${title(g)}`, '');
            md.push(`Estado: \`${[...g.alvos].join('`, `') || '—'}\` · registros: ${g.registros}${g.viaParam ? ` · via parâmetro: ${g.viaParam}` : ''}`, '');
            md.push('```js');
            if (g.tipo === 'CF') {
                md.push(`// L ${g.L}`.padEnd(12) + codeAt(mergeLines, g.L));
                md.push(`// R ${g.R}`.padEnd(12) + codeAt(mergeLines, g.R));
            } else {
                md.push(`// ${g.first} ${g.firstLine}`.padEnd(12) + codeAt(mergeLines, g.firstLine) + `   // ${VERB[g.tipo][0]}`);
                md.push(`// ${g.second} ${g.secondLine}`.padEnd(12) + codeAt(mergeLines, g.secondLine) + `   // ${VERB[g.tipo][1]}`);
            }
            if (g.base) md.push(`// base ${g.base}`.padEnd(12) + codeAt(mergeLines, g.base) + '   // confluência');
            md.push('```');
            const kind = g.tipo.toLowerCase();
            const st = [...stacks.entries()].find(([k]) => g.chaves.includes(k.slice(kind.length + 1)) && k.startsWith(kind + '|'))
                || [...stacks.entries()].find(([k]) => k.startsWith(kind + '|') && k.includes(`${g.L}|`) && k.includes(`${g.R}@`));
            g.stack = st ? st[1].map(s => s.line) : [];
            if (st && st[1].length) md.push('', `Pilha de chamadas no momento: ${st[1].map(s => `${path.basename(s.file)}:${s.line}`).join(' → ')}`);
            md.push('');
        }
        writeAnnotated(dir, r, m, pairs, mergeLines);
        md.push('## Para preencher', '', 'Na planilha `experiments/results/resultados.xlsx`, aba **Conflitos sorteados**, linha deste caso: um destes conflitos foi sorteado para a análise manual.', '');
        md.push(`---`, `Arquivos de código copiados de [${r.projeto}](${url}) para fins de pesquisa; pertencem aos autores do projeto e seguem a licença dele.`);
        fs.writeFileSync(path.join(dir, 'README.md'), md.join('\n') + '\n');

        meta.push({
            id: c.id, grupo: c.grupo, pasta: path.relative(OUT, dir), sample_id: r.sample_id, projeto: r.projeto, arquivo: r.arquivo,
            merge: m.merge_commit, url: `${url}/commit/${m.merge_commit}`, modo: r.modo, comando_testes: testCmd,
            OA: n(r.OA), DF: n(r.DF), CF: n(r.CF), registros: cs.length, pares: pairs.length,
            diretos: cs.filter(k => k.natureza === 'direto').length, transitivos: cs.filter(k => k.natureza === 'transitivo').length,
            via_parametro: cs.filter(k => k.via_parametro === 'sim').length, mesma_funcao: x.mesma_funcao || '', mesma_funcao_detalhe: x.mesma_funcao_detalhe || '',
            linhas_L: r.linhas_L, linhas_R: r.linhas_R,
            conflitos: pairs.map((g, i) => ({
                n: i + 1, tipo: g.tipo, natureza: [...g.naturezas].join('/'), registros: g.registros, via_parametro: g.viaParam,
                primeiro: g.tipo === 'CF' ? 'L' : g.first, linha1: g.tipo === 'CF' ? g.L : g.firstLine,
                segundo: g.tipo === 'CF' ? 'R' : g.second, linha2: g.tipo === 'CF' ? g.R : g.secondLine, base: g.base || null,
                codigo1: codeAt(mergeLines, g.tipo === 'CF' ? g.L : g.firstLine), codigo2: codeAt(mergeLines, g.tipo === 'CF' ? g.R : g.secondLine),
                codigo_base: g.base ? codeAt(mergeLines, g.base) : '', alvos: [...g.alvos].join(' '), pilha: (g.stack || []).join(' → '),
                origem1: Object.values(g.origem || {})[0] || '', origem2: Object.values(g.origem || {})[1] || '', chaves: g.chaves,
            })),
            pares_resumo: pairs.slice(0, 6).map(short_).join('; ') + (pairs.length > 6 ? `; … (+${pairs.length - 6})` : ''),
        });
    }
    fs.writeFileSync(path.join(OUT, 'casos.json'), JSON.stringify(meta, null, 1) + '\n');

    // Índice da análise manual (o que a equipe vê ao abrir a pasta no GitHub)
    const idx = [];
    idx.push('# Análise manual dos conflitos do lote', '');
    idx.push(`As ${meta.length} amostras em que a análise dinâmica detectou conflito no lote completo (976 amostras de merges reais, coleta Newminerjs). Cada pasta tem tudo o que é preciso para julgar o caso sem rodar nada.`, '');
    idx.push('## Como fazer', '');
    idx.push('A análise é **por conflito**: um conflito foi sorteado de cada caso (29 no total, semente fixa), e cada um é julgado como interferência real ou falso positivo.', '');
    idx.push('1. Abra a planilha [`../resultados.xlsx`](../resultados.xlsx), aba **Conflitos sorteados**: uma linha por caso, com o conflito sorteado (o número # é o do README do caso), as duas linhas, o código e de onde veio a branch de cada linha.');
    idx.push('2. Abra a pasta do caso. `merge_anotado.js` é o `merge.js` com `[L]`, `[R]` e o papel de cada linha nos conflitos (`◀ #n`); o `README.md` lista os conflitos; `diff_left.diff` e `diff_right.diff` mostram o que cada lado mudou; `base.js`, `left.js`, `right.js` e `merge.js` são as quatro versões.');
    idx.push('3. Se uma linha do conflito não foi alterada por aquele lado ("herdou"), julgue a mudança verdadeira, isto é, a linha indicada. Compare base + só L, base + só R e o merge: o merge tem um comportamento que nenhum dos dois produz sozinho, ou quebra o que um dos lados queria?');
    idx.push('4. Preencha as colunas amarelas da linha do caso.', '');
    idx.push('**Grupos.** A: conflito direto e Left e Right alteraram a mesma função (candidatos mais fortes). B: conflito direto em funções diferentes ou sem correspondência estática (interferência indireta: o que distingue a análise dinâmica). C: só conflitos transitivos, ou arquivo gerado/minificado (suspeitos de falso positivo).', '');
    idx.push('| Caso | Grupo | Projeto | Arquivo | Executado por | OA/DF/CF | Conflitos | Mesma função? |', '|---|:-:|---|---|---|---|--:|---|');
    for (const c of meta) {
        idx.push(`| [${c.id}](${c.pasta.replace(/^casos\//, 'casos/')}) | ${c.grupo} | ${c.projeto.split('__')[1]} | \`${c.arquivo}\` | ${c.modo === 'testes' ? 'testes' : 'arquivo'} | ${c.OA}/${c.DF}/${c.CF} | ${c.pares} | ${c.mesma_funcao || '—'} |`);
    }
    idx.push('', 'Histórico: uma primeira rodada por amostra, com três revisores, foi deixada de lado; as respostas preenchidas nela (Italo, 15 casos) estão em [`historico/`](historico/) e a conferência em [`CONFERENCIA_ITALO.md`](CONFERENCIA_ITALO.md).');
    idx.push('', 'Gerado por `experiments/results/gerar_casos.js` a partir do lote. Os arquivos de código pertencem aos autores de cada projeto e seguem a licença dele; estão aqui só para a pesquisa.');
    fs.writeFileSync(path.join(OUT, 'README.md'), idx.join('\n') + '\n');
    console.log(`${meta.length} casos em ${path.relative(process.cwd(), path.join(OUT, 'casos'))}`);
    console.log('grupos:', meta.reduce((a, c) => (a[c.grupo] = (a[c.grupo] || 0) + 1, a), {}));
}

main();
