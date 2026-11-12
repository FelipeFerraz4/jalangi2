// CSV mínimo: BOM, campos entre aspas (com "" e quebras de linha dentro) e separador configurável.
const fs = require('fs');

function parseCsv(text, separator = ',') {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
            if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (ch === '"') quoted = false;
            else field += ch;
        } else if (ch === '"') {
            quoted = true;
        } else if (ch === separator) {
            row.push(field); field = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(field); field = '';
            rows.push(row); row = [];
        } else {
            field += ch;
        }
    }
    if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
    return rows;
}

// Lê um CSV e devolve uma lista de objetos, com o cabeçalho como chaves
function readCsv(file, separator = ',') {
    const [header, ...rows] = parseCsv(fs.readFileSync(file, 'utf-8'), separator);
    return rows.filter(r => r.length > 1 || r[0] !== '').map(r => {
        const o = {};
        header.forEach((h, i) => { o[h] = r[i] === undefined ? '' : r[i]; });
        return o;
    });
}

function formatCsv(rows) {
    const cell = c => /[",\n\r]/.test(String(c)) ? '"' + String(c).replace(/"/g, '""') + '"' : String(c);
    return rows.map(r => r.map(cell).join(',')).join('\n') + '\n';
}

module.exports = { parseCsv, readCsv, formatCsv };
