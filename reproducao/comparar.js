// Compara uma execução refeita com a versão publicada em dados/, por amostra.
//
//   node reproducao/comparar.js lote   [pasta]   resultados.csv do lote refeito (padrão dados/execucoes/lote)
//                                                 × dados/lote/resultados.csv
//   node reproducao/comparar.js coleta [pasta]   manifesto.csv refeito (padrão dados/execucoes/coleta)
//                                                 × dados/coleta/manifesto.csv
//
// Diferenças no lote são esperadas em parte: o npm install de projetos antigos pode baixar outras versões das
// dependências, e suítes com tempo esgotado variam com a máquina. O resumo mostra quantas amostras mudaram
// e em quê, para julgar se os resultados do trabalho se mantêm.
const fs = require('fs');
const path = require('path');
const C = require('../experiments/lib/caminhos');
const { readCsv } = require('../experiments/wild/lib/csv');

const [tipo, pasta] = process.argv.slice(2);
const CFG = {
    lote: { arquivo: 'resultados.csv', sep: ';', publicado: path.join(C.LOTE_PUBLICADO, 'resultados.csv'), padrao: path.join(C.EXECUCOES, 'lote'),
        colunas: ['execucao', 'modo', 'OA', 'DF', 'CF', 'L_executadas', 'R_executadas'] },
    coleta: { arquivo: 'manifesto.csv', sep: ',', publicado: C.MANIFESTO, padrao: path.join(C.EXECUCOES, 'coleta'),
        colunas: ['merge_commit', 'file_path', 'left_lines', 'right_lines', 'both_lines', 'instrumentable'] },
}[tipo];
if (!CFG) { console.error('uso: node reproducao/comparar.js lote|coleta [pasta]'); process.exit(2); }

const refeito = path.join(path.resolve(pasta || CFG.padrao), CFG.arquivo);
if (!fs.existsSync(refeito)) { console.error(`não achei ${refeito}`); process.exit(2); }
const ler = f => new Map(readCsv(f, CFG.sep).map(r => [r.sample_id, r]));
const A = ler(CFG.publicado), B = ler(refeito);

const soPublicado = [...A.keys()].filter(k => !B.has(k)), soRefeito = [...B.keys()].filter(k => !A.has(k));
const porColuna = {}, mudaram = [];
for (const [id, a] of A) {
    const b = B.get(id);
    if (!b) continue;
    const dif = CFG.colunas.filter(c => (a[c] || '') !== (b[c] || ''));
    dif.forEach(c => { porColuna[c] = (porColuna[c] || 0) + 1; });
    if (dif.length) mudaram.push({ id, projeto: a.projeto || a.project, dif: dif.map(c => `${c}: ${a[c] || '∅'} → ${b[c] || '∅'}`).join(', ') });
}
console.log(`publicado: ${A.size} amostras | refeito: ${B.size} | iguais: ${A.size - soPublicado.length - mudaram.length}`);
if (soPublicado.length) console.log(`só no publicado: ${soPublicado.length}`);
if (soRefeito.length) console.log(`só no refeito: ${soRefeito.length}`);
console.log(`com diferença: ${mudaram.length}`, Object.keys(porColuna).length ? `(por coluna: ${JSON.stringify(porColuna)})` : '');
if (tipo === 'lote') {
    const conf = m => [...m.values()].filter(r => +r.OA + +r.DF + +r.CF > 0).length;
    console.log(`amostras com conflito: publicado ${conf(A)}, refeito ${conf(B)}`);
}
mudaram.slice(0, 20).forEach(m => console.log(`  ${m.id.slice(0, 12)} ${m.projeto}: ${m.dif}`));
if (mudaram.length > 20) console.log(`  … e mais ${mudaram.length - 20}`);
process.exit(soPublicado.length + soRefeito.length + mudaram.length ? 1 : 0);
