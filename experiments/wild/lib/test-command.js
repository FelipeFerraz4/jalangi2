// Monta o comando de testes de uma amostra a partir do scripts.test do package.json (modo `testes`).
// Função pura, testada em test-wild.js.
//   * sem scripts.test, ou o "no test specified" do npm init → null (a amostra fica `sem_testes`);
//   * o script é quebrado nos `&&` e saem os passos que não exercitam o código no Node: lint/estilo e testes
//     de navegador (karma, phantomjs, zuul...). Sobrando nada → null;
//   * os passos restantes são unidos por `;`: um passo com teste falhando não impede os seguintes de rodar;
//   * `mocha` vira `_mocha`: o bin/mocha antigo (1.x) roda o _mocha num processo filho com `customFds`, que o
//     Node atual não aceita, e a saída some; o _mocha roda os testes no próprio processo.
const DROP = /(^|[\s/:-])(lint|jshint|jscs|eslint|standard|semistandard|xo|tslint|karma|phantomjs|zuul|testling|airtap|test-browser|browser)([\s:]|$)/;

function testCommand(pkg) {
    const script = pkg && pkg.scripts && typeof pkg.scripts.test === 'string' ? pkg.scripts.test.trim() : '';
    if (!script || /no test specified/.test(script)) return { command: null, dropped: [] };
    const steps = script.split('&&').map(s => s.trim()).filter(Boolean);
    const kept = [], dropped = [];
    for (const step of steps) (DROP.test(step) ? dropped : kept).push(step);
    const fixed = kept.map(step => step.replace(/(^|[\s/])mocha(?=\s|$)/g, '$1_mocha'));
    return { command: fixed.length ? fixed.join(' ; ') : null, dropped };
}

module.exports = { testCommand };
