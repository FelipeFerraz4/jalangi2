// Onde ficam os dados que não são código. Tudo pode ser trocado por variável de ambiente, e o padrão é a
// pasta dados/ deste repositório (veja dados/README.md):
//
//   DADOS              raiz dos dados                                  padrão: <repo>/dados
//   dados/coleta/      manifesto e mapas de linhas L/R (publicados)
//   dados/lote/        resultado do lote usado no trabalho (publicado)
//   REPOS              clones dos projetos (2,4 GB, não versionado)    padrão: <DADOS>/repos
//   EXECUCOES          execuções novas do lote (não versionado)        padrão: <DADOS>/execucoes
//   FONTES             repositórios de terceiros baixados por reproducao/fontes.sh (não versionado)
//   SCAZ, NEWMINERJS   clones do SCAz.js e do Newminerjs                padrão: <FONTES>/SCAz.js, <FONTES>/Newminerjs
//                      (se não existirem lá, usa a pasta irmã do repositório: ../SCAz.js, ../Newminerjs)
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const DADOS = path.resolve(process.env.DADOS || path.join(RAIZ, 'dados'));
const FONTES = path.resolve(process.env.FONTES || path.join(DADOS, 'fontes'));
const primeiroQueExiste = (...opcoes) => opcoes.find(p => fs.existsSync(p)) || opcoes[0];

module.exports = {
    RAIZ,
    DADOS,
    FONTES,
    COLETA: path.join(DADOS, 'coleta'),
    MANIFESTO: path.join(DADOS, 'coleta', 'manifesto.csv'),
    MAPAS: path.join(DADOS, 'coleta', 'maps'),
    LOTE_PUBLICADO: path.join(DADOS, 'lote'),
    REPOS: path.resolve(process.env.REPOS || path.join(DADOS, 'repos')),
    EXECUCOES: path.resolve(process.env.EXECUCOES || path.join(DADOS, 'execucoes')),
    SCAZ: path.resolve(process.env.SCAZ || primeiroQueExiste(path.join(FONTES, 'SCAz.js'), path.join(RAIZ, '..', 'SCAz.js'))),
    NEWMINERJS: path.resolve(process.env.NEWMINERJS || primeiroQueExiste(path.join(FONTES, 'Newminerjs'), path.join(RAIZ, '..', 'Newminerjs'))),
};
