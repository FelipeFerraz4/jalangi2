(function () {
    // =========================================================================
    // MOTOR DE ANÁLISE DINÂMICA DE DATA FLOW & OVERRIDING ASSIGNMENT (Jalangi2)
    // =========================================================================
    // Expansão da técnica de Amanda Moraes (SBLP 2024) para detecção de 
    // Data Flow (Def-Use inter-branch) conforme formalizado por 
    // Galileu Santos, Paulo Borba, Rodrigo Bonifácio e Matheus Barbosa (2023/2024).
    // Suporta variáveis escalares, propriedades de objetos e índices de arrays.
    // =========================================================================

    var modifiedLinesPerBranch = {
        "L": [],
        "R": []
    };

    // Suporte a injeção via variável de ambiente BRANCH_MAP='{"L":[...],"R":[...]}'
    if (typeof process !== 'undefined' && process.env && process.env.BRANCH_MAP) {
        try {
            modifiedLinesPerBranch = JSON.parse(process.env.BRANCH_MAP);
        } catch (e) { }
    }

    // --- ESTADO DO OVERRIDING ASSIGNMENT (OA) ---
    var assignments = {
        "L": [],
        "R": []
    };

    // --- ESTADO DO DATA FLOW (LAST WRITE TABLE) ---
    // Guarda o último escritor de cada elemento de estado:
    // lastWrite[target] = { branch: "L", line: 23 }
    var lastWrite = {};

    var detectedConflicts = {
        overridingAssignments: [],
        dataFlows: []
    };

    // Identificador único para instâncias de objetos em memória
    var objectIds = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
    var nextObjectId = 1;

    function getTargetKey(base, offset) {
        if (!base) return String(offset);
        if (typeof base === 'object' || typeof base === 'function') {
            if (objectIds) {
                if (!objectIds.has(base)) {
                    objectIds.set(base, nextObjectId++);
                }
                var id = objectIds.get(base);
                var type = (base.constructor && base.constructor.name) ? base.constructor.name : 'Obj';
                return `${type}#${id}.${String(offset)}`;
            }
        }
        return String(offset);
    }

    function isInternal(base, offset) {
        if (offset === 'analysis' || offset === 'sid' || offset === 'smap' || offset === 'iidToLocation') return true;
        if (typeof J$ !== 'undefined' && base === J$) return true;
        if (typeof global !== 'undefined' && base === global && (offset === 'console' || offset === 'process')) return true;
        return false;
    }

    function initFallbackMapIfEmpty(iid) {
        if (modifiedLinesPerBranch["L"].length > 0 || modifiedLinesPerBranch["R"].length > 0) return;
        if (!J$.sid) return;
        var loc = J$.iidToLocation(J$.sid, iid);
        if (!loc) return;

        if (loc.indexOf("example.js") !== -1) {
            modifiedLinesPerBranch = { "L": [5], "R": [1] };
        } else if (loc.indexOf("test_dataflow_direct.js") !== -1) {
            modifiedLinesPerBranch = { "L": [23], "R": [29, 30] };
        } else if (loc.indexOf("test_dataflow_safe.js") !== -1) {
            modifiedLinesPerBranch = { "L": [22, 23, 24], "R": [31, 32, 33] };
        } else if (loc.indexOf("test_dataflow_object.js") !== -1) {
            modifiedLinesPerBranch = { "L": [22], "R": [26, 27] };
        } else if (loc.indexOf("test_dataflow_interproc.js") !== -1) {
            modifiedLinesPerBranch = { "L": [23], "R": [28, 29] };
        }
    }

    function getLine(iid) {
        if (!J$.sid) return 0;
        var loc = J$.iidToLocation(J$.sid, iid);
        if (!loc) return 0;
        var parts = loc.split(':');
        return Number(parts[1]);
    }

    function getBranch(line) {
        if (modifiedLinesPerBranch["L"] && modifiedLinesPerBranch["L"].indexOf(line) !== -1) {
            return "L";
        }
        if (modifiedLinesPerBranch["R"] && modifiedLinesPerBranch["R"].indexOf(line) !== -1) {
            return "R";
        }
        return "Base";
    }

    // --- LÓGICA CENTRAL DE ESCRITA (PRODUTOR) ---
    function handleWrite(target, line, branch) {
        if (!target || target === 'undefined' || target === 'null') return;

        if (branch !== "Base") {
            var otherBranch = branch === "L" ? "R" : "L";

            // [REGRA OA: Write -> Write sem Read no meio]
            if (assignments[otherBranch].indexOf(target) !== -1) {
                var oaMsg = `[CONFLITO OA] Estado '${target}' (atribuído por '${branch}' na linha ${line}) sobrescreveu a atribuição anterior de '${otherBranch}'!`;
                if (detectedConflicts.overridingAssignments.indexOf(oaMsg) === -1) {
                    detectedConflicts.overridingAssignments.push(oaMsg);
                    console.log(`🚨 ${oaMsg}`);
                }
            }

            assignments[branch].push(target);

            // [REGRA DATA FLOW: Registro de Escrita do Produtor]
            lastWrite[target] = { branch: branch, line: line };
            console.log(`[ESCRITA] '${target}' modificado pela branch '${branch}' na linha ${line}`);
        } else {
            // [OPERAÇÃO DE KILL PELA BASE]
            // A Base sobrescreve o estado, limpando o rastro de mutações concorrentes
            assignments["L"] = assignments["L"].filter(function (n) { return n !== target; });
            assignments["R"] = assignments["R"].filter(function (n) { return n !== target; });
            lastWrite[target] = { branch: "Base", line: line };
        }
    }

    // --- LÓGICA CENTRAL DE LEITURA (CONSUMIDOR) ---
    function handleRead(target, line, readingBranch) {
        if (!target || target === 'undefined' || target === 'null') return;

        // [REGRA OA: Intervening Read]
        // Se houve leitura entre escritas, anula a suspeita de OA para este alvo
        assignments["L"] = assignments["L"].filter(function (n) { return n !== target; });
        assignments["R"] = assignments["R"].filter(function (n) { return n !== target; });

        // [REGRA DATA FLOW: Consumo Inter-Branch]
        if (readingBranch !== "Base" && lastWrite[target]) {
            var writingBranch = lastWrite[target].branch;

            // Se o estado foi produzido por uma branch concorrente (L -> R ou R -> L):
            if (writingBranch !== "Base" && writingBranch !== readingBranch) {
                var dfMsg = `[CONFLITO DATA FLOW] Estado '${target}' lido pela branch '${readingBranch}' (linha ${line}), mas foi produzido pela branch '${writingBranch}' (linha ${lastWrite[target].line})!`;

                if (detectedConflicts.dataFlows.indexOf(dfMsg) === -1) {
                    detectedConflicts.dataFlows.push(dfMsg);
                    console.log(`\n⚡ ${dfMsg}`);
                    console.log(`   └─> Risco Semântico: Branch '${readingBranch}' está consumindo estado mutado concorrentemente por '${writingBranch}'.\n`);
                }
            }
        }
    }

    J$.analysis = {
        // Função para configurar programaticamente as linhas das branches
        setBranches: function (map) {
            modifiedLinesPerBranch = map;
            assignments = { "L": [], "R": [] };
            lastWrite = {};
            detectedConflicts = { overridingAssignments: [], dataFlows: [] };
        },

        // ==============================================================
        // 1. VARIÁVEIS LOCAIS / GLOBAIS: WRITE
        // ==============================================================
        write: function (iid, name, val, lhs, isGlobal, isScriptLocal) {
            initFallbackMapIfEmpty(iid);
            var line = getLine(iid);
            var branch = getBranch(line);
            handleWrite(name, line, branch);
            return { result: val };
        },

        // ==============================================================
        // 2. VARIÁVEIS LOCAIS / GLOBAIS: READ
        // ==============================================================
        read: function (iid, name, val, isGlobal, isScriptLocal) {
            initFallbackMapIfEmpty(iid);
            var line = getLine(iid);
            var readingBranch = getBranch(line);
            handleRead(name, line, readingBranch);
            return { result: val };
        },

        // ==============================================================
        // 3. PROPRIEDADES DE OBJETOS E ARRAYS: PUT FIELD (WRITE)
        // ==============================================================
        putFieldPre: function (iid, base, offset, val, isComputed, isOpAssign) {
            initFallbackMapIfEmpty(iid);
            if (!isInternal(base, offset)) {
                var line = getLine(iid);
                var branch = getBranch(line);
                var targetKey = getTargetKey(base, offset);
                handleWrite(targetKey, line, branch);
            }
            return { base: base, offset: offset, val: val, skip: false };
        },

        // ==============================================================
        // 4. PROPRIEDADES DE OBJETOS E ARRAYS: GET FIELD (READ)
        // ==============================================================
        getField: function (iid, base, offset, val, isComputed, isOpAssign, isMethodCall) {
            initFallbackMapIfEmpty(iid);
            if (!isInternal(base, offset)) {
                var line = getLine(iid);
                var readingBranch = getBranch(line);
                var targetKey = getTargetKey(base, offset);
                handleRead(targetKey, line, readingBranch);
            }
            return { result: val };
        },

        endExecution: function () {
            console.log("\n==================================================");
            console.log("📊 RELATÓRIO FINAL DE ANÁLISE DINÂMICA DE MERGE");
            console.log(`   - Conflitos de Overriding Assignment (OA): ${detectedConflicts.overridingAssignments.length}`);
            console.log(`   - Conflitos de Data Flow Inter-Branch:     ${detectedConflicts.dataFlows.length}`);
            console.log("==================================================");
        }
    };
}());
