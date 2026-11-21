// Trava de execução única por arquivo (usada pelo lote e por cada frente do run-wild.js)
const fs = require('fs');

// Trava de execução única: grava o PID em `file`; se a trava existe e o processo dono ainda vive, devolve o PID dele
// (quem chamou deve desistir). Trava de processo morto é retomada. A trava sai quando o processo termina.
function acquireLock(file) {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            fs.writeFileSync(file, String(process.pid), { flag: 'wx' });
            const release = () => { try { if (fs.readFileSync(file, 'utf-8') === String(process.pid)) fs.unlinkSync(file); } catch (e) { } };
            process.on('exit', release);
            return 0;
        } catch (e) {
            if (e.code !== 'EEXIST') throw e;
            const owner = parseInt(fs.readFileSync(file, 'utf-8'), 10);
            try { process.kill(owner, 0); return owner; } catch (err) { fs.rmSync(file, { force: true }); }
        }
    }
    return -1;
}

module.exports = { acquireLock };
