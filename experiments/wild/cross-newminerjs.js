// Cruza o resultado dinâmico de uma execução (resultados.csv) com a análise estática do Newminerjs
// (analise_left_right.xlsx, aba "Cenários": "Mesma função?" diz se Left e Right alteraram a mesma função).
// As duas bases usam o mesmo ID de amostra. Grava na pasta da execução:
//   cruzamento_newminerjs.csv   uma linha por amostra: execução, OA/DF/CF e a classificação estática ao lado
//   tabela_mesma_funcao.csv     Sim / Não / Inconclusivo × amostras que executaram L e R × amostras com conflito
//
// Uso: node experiments/wild/cross-newminerjs.js <analise_left_right.xlsx> <pasta da execução> [--sep ,]
//   --sep ,  separador vírgula sem BOM (importa direto no Google Sheets); o padrão é ';' com BOM (Excel)
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { readCsv, formatCsv } = require('./lib/csv');

// ---- leitura mínima de .xlsx (zip com XML), sem dependências: usa o unzip do sistema ----
const unzip = (file, entry) => {
    const r = spawnSync('unzip', ['-p', file, entry], { encoding: 'utf-8', maxBuffer: 1 << 30 });
    if (r.status !== 0) throw new Error(`não consegui ler ${entry} de ${file}: ${r.stderr || r.error}`);
    return r.stdout;
};
const unescapeXml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, '&');
// as tags podem vir com prefixo de namespace (<x:row>, <x:c>), conforme o programa que gravou o arquivo
const P = '(?:\\w+:)?';
const rx = (src, flags = 'g') => new RegExp(src.replace(/~/g, P), flags);
const texts = xml => [...xml.matchAll(rx('<~t(?:\\s[^>]*)?>([\\s\\S]*?)</~t>'))].map(m => unescapeXml(m[1])).join('');
const colIndex = ref => [...ref.match(/^[A-Z]+/)[0]].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

function readSheet(file, sheetName) {
    const shared = (() => { try { return [...unzip(file, 'xl/sharedStrings.xml').matchAll(rx('<~si>([\\s\\S]*?)</~si>'))].map(m => texts(m[1])); } catch (e) { return []; } })();
    const sheets = [...unzip(file, 'xl/workbook.xml').matchAll(rx('<~sheet\\b[^>]*>'))].map(m => ({
        name: unescapeXml((m[0].match(/name="([^"]*)"/) || [])[1] || ''), rid: (m[0].match(/r:id="([^"]*)"/) || [])[1],
    }));
    const sheet = sheets.find(s => s.name === sheetName);
    if (!sheet) throw new Error(`aba "${sheetName}" não encontrada (abas: ${sheets.map(s => s.name).join(', ')})`);
    const rel = [...unzip(file, 'xl/_rels/workbook.xml.rels').matchAll(/<Relationship\b[^>]*>/g)].map(m => m[0]).find(r => r.includes(`Id="${sheet.rid}"`));
    const target = rel.match(/Target="([^"]*)"/)[1].replace(/^\/?(xl\/)?/, '');
    const rows = [];
    for (const [, body] of unzip(file, 'xl/' + target).matchAll(rx('<~row\\b[^>]*>([\\s\\S]*?)</~row>'))) {
        const row = [];
        for (const m of body.matchAll(rx('<~c\\b([^>]*?)(?:/>|>([\\s\\S]*?)</~c>)'))) {
            const ref = (m[1].match(/r="([A-Z]+\d+)"/) || [])[1], type = (m[1].match(/t="([^"]*)"/) || [])[1], inner = m[2] || '';
            const v = (inner.match(rx('<~v>([\\s\\S]*?)</~v>', '')) || [])[1];
            row[colIndex(ref)] = type === 's' ? shared[+v] : type === 'inlineStr' ? texts(inner) : v === undefined ? '' : unescapeXml(v);
        }
        rows.push(Array.from(row, c => (c === undefined ? '' : c)));
    }
    return rows;
}

// ---- cruzamento (puro, testado em test-wild.js) ----
const n = x => parseInt(x || '0', 10) || 0;
const CROSS_COLUMNS = ['sample_id', 'cenario_newminerjs', 'projeto', 'merge_commit', 'arquivo', 'execucao', 'modo', 'categoria_erro',
    'executou_L_e_R', 'OA', 'DF', 'CF', 'tem_conflito', 'mesma_funcao', 'mesma_funcao_detalhe', 'funcoes_em_comum',
    'fora_de_funcao_L', 'fora_de_funcao_R', 'mudanca_L', 'mudanca_R', 'link_merge'];
const CLASSES = ['Sim', 'Não', 'Inconclusivo'];

// results: linhas do resultados.csv; scenarios: linhas da aba Cenários como objetos (cabeçalho → valor)
function crossRows(results, scenarios) {
    const byId = new Map(scenarios.map(s => [s['ID'], s]));
    return results.map(r => {
        const s = byId.get(r.sample_id) || {};
        const detail = s['Mesma função?'] || '';
        return {
            sample_id: r.sample_id, cenario_newminerjs: s['Cenário'] || '', projeto: r.projeto, merge_commit: r.merge_commit, arquivo: r.arquivo,
            execucao: r.execucao, modo: r.modo, categoria_erro: r.categoria_erro,
            executou_L_e_R: n(r.L_executadas) && n(r.R_executadas) ? 'sim' : 'nao',
            OA: r.OA, DF: r.DF, CF: r.CF, tem_conflito: n(r.OA) + n(r.DF) + n(r.CF) ? 'sim' : 'nao',
            mesma_funcao: detail ? detail.split(':')[0].trim() : 'sem_cenario', mesma_funcao_detalhe: detail,
            funcoes_em_comum: s['Funções em comum (resumo)'] || '', fora_de_funcao_L: s['Fora de função Left?'] || '', fora_de_funcao_R: s['Fora de função Right?'] || '',
            mudanca_L: s['Mudança Left (resumo)'] || '', mudanca_R: s['Mudança Right (resumo)'] || '', link_merge: s['Fonte Merge'] || '',
        };
    });
}

const TABLE_COLUMNS = ['mesma_funcao', 'amostras', 'executaram_L_e_R', 'com_conflito', 'taxa_conflito_pct'];
function sameFunctionTable(cross) {
    const classes = [...CLASSES, ...new Set(cross.map(c => c.mesma_funcao).filter(c => !CLASSES.includes(c)))];
    const line = (label, rows) => {
        const both = rows.filter(r => r.executou_L_e_R === 'sim'), conf = both.filter(r => r.tem_conflito === 'sim');
        return { mesma_funcao: label, amostras: rows.length, executaram_L_e_R: both.length, com_conflito: conf.length,
            taxa_conflito_pct: both.length ? (100 * conf.length / both.length).toFixed(1) : '' };
    };
    return [...classes.map(k => line(k, cross.filter(c => c.mesma_funcao === k))).filter(l => l.amostras), line('TOTAL', cross)];
}

function main() {
    const args = process.argv.slice(2);
    const sepAt = args.indexOf('--sep');
    const sep = sepAt === -1 ? ';' : args.splice(sepAt, 2)[1];
    const [xlsx, runDir] = args;
    if (!xlsx || !runDir) { console.error('uso: node experiments/wild/cross-newminerjs.js <analise_left_right.xlsx> <pasta da execução> [--sep ,]'); process.exit(2); }
    const [header, ...body] = readSheet(xlsx, 'Cenários');
    const scenarios = body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] === undefined ? '' : r[i]])));
    const results = readCsv(path.join(runDir, 'resultados.csv'), ';');
    const cross = crossRows(results, scenarios);
    const table = sameFunctionTable(cross);
    const prefix = sep === ';' ? '﻿' : '';
    const write = (name, cols, rows) => fs.writeFileSync(path.join(runDir, name), prefix + formatCsv([cols, ...rows.map(r => cols.map(c => r[c]))], sep));
    write('cruzamento_newminerjs.csv', CROSS_COLUMNS, cross);
    write('tabela_mesma_funcao.csv', TABLE_COLUMNS, table);
    const missing = cross.filter(c => c.mesma_funcao === 'sem_cenario').length;
    console.log(`${cross.length} amostras cruzadas com ${scenarios.length} cenários${missing ? ` (${missing} sem cenário no Newminerjs)` : ''}`);
    console.table(table);
    console.log(`→ ${path.join(runDir, 'cruzamento_newminerjs.csv')}\n→ ${path.join(runDir, 'tabela_mesma_funcao.csv')}`);
}

module.exports = { crossRows, sameFunctionTable, readSheet };
if (require.main === module) main();
