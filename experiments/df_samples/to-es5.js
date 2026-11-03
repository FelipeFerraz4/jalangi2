// Converte as samples traduzidas pelo JSweet (ES6) para ES5, que é o que o Jalangi2 instrumenta.
// `retainLines` mantém cada comando na mesma linha do arquivo original, então o mapa
// linha Java -> linha JS continua valendo para o ES5.
// Requer @babel/core e @babel/preset-env (instalados fora deste repositório):
//   NODE_PATH=/caminho/node_modules node experiments/df_samples/to-es5.js <entrada.js> <saida.js>
const babel = require('@babel/core');
const fs = require('fs');

const [, , input, output] = process.argv;
if (!input || !output) {
    console.error('uso: node to-es5.js <entrada.js> <saida.js>');
    process.exit(2);
}

const result = babel.transformSync(fs.readFileSync(input, 'utf-8'), {
    presets: [['@babel/preset-env', { targets: { ie: '9' }, modules: false }]],
    retainLines: true,
    comments: false,
    sourceType: 'script',
    configFile: false,
    babelrc: false
});
fs.writeFileSync(output, result.code + '\n');
