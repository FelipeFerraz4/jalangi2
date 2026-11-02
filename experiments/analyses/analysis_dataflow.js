(function () {
    // =========================================================================
    // MOTOR DE ANÁLISE DINÂMICA DE DATA FLOW & OVERRIDING ASSIGNMENT (Jalangi2)
    // =========================================================================
    // Expansão da técnica de Amanda Moraes (SBLP 2024) para detecção de 
    // Data Flow (Def-Use inter-branch) conforme formalizado por 
    // Galileu Santos, Paulo Borba, Rodrigo Bonifácio e Matheus Barbosa (2023/2024).
    // Suporta variáveis escalares, propriedades de objetos e índices de arrays.
    //
    // Execução: encadeada com ChainedAnalyses.js e SMemory.js (memória sombra),
    // que identificam variáveis por frame e propriedades por objeto dono.
    // Interprocedural: código executado dentro de uma função chamada por L ou R
    // é atribuído a essa branch (pilha de chamadas, Algoritmo 1 de Moraes et al.).
    // OA: só há interferência se os valores atribuídos pelas branches forem diferentes.
    // =========================================================================

    // Mapa linha -> branch ("L" ou "R"); linhas fora do mapa pertencem à Base.
    // Aceita dois formatos de entrada:
    //   {"L":[4],"R":[6,7]}              (listas de linhas por branch)
    //   {"4":"L","6":"R","7":"R"}        (formato do SCAz.js / Amanda Moraes)
    var lineToBranch = {};

    function loadBranchMap(map) {
        lineToBranch = {};
        if (!map) return;
        if (Array.isArray(map["L"]) || Array.isArray(map["R"])) {
            ["L", "R"].forEach(function (b) {
                (map[b] || []).forEach(function (line) { lineToBranch[line] = b; });
            });
        } else {
            Object.keys(map).forEach(function (line) { lineToBranch[Number(line)] = map[line]; });
        }
    }

    // Suporte a carregamento dinâmico via variável de ambiente ou arquivo JSON
    if (typeof process !== 'undefined' && process.env) {
        if (process.env.BRANCH_MAP) {
            try {
                loadBranchMap(JSON.parse(process.env.BRANCH_MAP));
            } catch (e) { }
        } else if (process.env.BRANCH_MAP_FILE) {
            try {
                var fs = require('fs');
                if (fs.existsSync(process.env.BRANCH_MAP_FILE)) {
                    loadBranchMap(JSON.parse(fs.readFileSync(process.env.BRANCH_MAP_FILE, 'utf-8')));
                }
            } catch (e) { }
        }
    }

    // --- ESTADO DO OVERRIDING ASSIGNMENT (OA) ---
    // assignments[branch][alvo] = { line, val }: última atribuição de cada branch ao alvo
    var assignments = {
        "L": {},
        "R": {}
    };

    // --- ESTADO DO DATA FLOW (LAST WRITE TABLE) ---
    // Guarda o último escritor de cada elemento de estado:
    // lastWrite[target] = { branch: "L", line: 23 }
    var lastWrite = {};

    // Rótulos legíveis dos alvos (a chave interna usa ids da memória sombra)
    var labels = {};

    // --- PILHA DE CHAMADAS ---
    // Guarda a branch de cada chamada em andamento (undefined = chamada de linha da Base) e a
    // profundidade de funções instrumentadas em que ela foi feita.
    // Código executado dentro de uma função chamada por L ou R é atribuído a essa branch.
    var callStack = [];
    var functionDepth = 0;

    var detectedConflicts = {
        overridingAssignments: [],
        dataFlows: []
    };

    // Identificador único para instâncias de objetos em memória
    var objectIds = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
    var nextObjectId = 1;

    function smemory() {
        return (typeof J$ !== 'undefined') ? J$.smemory : undefined;
    }

    function typeName(base) {
        return (base && base.constructor && base.constructor.name) ? base.constructor.name : 'Obj';
    }

    // Alvo de uma variável: identificada pelo frame que a declara (evita colisão entre escopos)
    function variableTarget(name) {
        var key = String(name);
        if (smemory()) {
            try {
                var id = smemory().getIDFromShadowObjectOrFrame(smemory().getShadowFrame(name));
                if (id !== undefined) key = 'frame' + id + '.' + name;
            } catch (e) { }
        }
        labels[key] = String(name);
        return key;
    }

    // Alvo de uma propriedade: identificada pelo objeto dono (aliasing aponta para o mesmo alvo)
    var objectIds = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
    var nextObjectId = 1;

    function fieldTarget(base, offset, isGetField) {
        if (!base || (typeof base !== 'object' && typeof base !== 'function')) return String(offset);
        var id;
        if (smemory()) {
            try {
                var owner = smemory().getShadowObject(base, offset, isGetField).owner;
                id = smemory().getIDFromShadowObjectOrFrame(owner);
            } catch (e) { }
        }
        if (id === undefined && objectIds) {
            if (!objectIds.has(base)) objectIds.set(base, nextObjectId++);
            id = 'x' + objectIds.get(base);
        }
        if (id === undefined) return String(offset);
        var key = 'obj' + id + '.' + String(offset);
        labels[key] = typeName(base) + '#' + id + '.' + String(offset);
        return key;
    }

    function isInternal(base, offset) {
        if (offset === 'analysis' || offset === 'sid' || offset === 'smap' || offset === 'iidToLocation') return true;
        if (typeof J$ !== 'undefined' && base === J$) return true;
        if (typeof global !== 'undefined' && base === global && (offset === 'console' || offset === 'process')) return true;
        return false;
    }

    // Localização no formato (arquivo:linhaIni:colIni:linhaFim:colFim)
    function getLines(iid) {
        if (!J$.sid) return [0, 0];
        var loc = J$.iidToLocation(J$.sid, iid);
        if (!loc) return [0, 0];
        var parts = loc.split(':');
        return [Number(parts[1]), Number(parts[3])];
    }

    // Branch de uma operação: percorre todas as linhas que ela ocupa (a última mapeada vence).
    // Atribuir uma função a um nome (X.prototype.foo = function () {...}) só conta a primeira linha:
    // o corpo é analisado linha a linha quando a função executa, e se contasse o corpo inteiro a
    // definição seria atribuída à branch de qualquer linha dele.
    function getBranch(iid, val) {
        var lines = getLines(iid);
        var last = (typeof val === 'function') ? lines[0] : lines[1];
        var branch;
        for (var line = lines[0]; line <= last; line++) {
            branch = lineToBranch[line] || branch;
        }
        return branch;
    }

    function stackBranch() {
        for (var i = callStack.length - 1; i >= 0; i--) {
            if (callStack[i].branch) return callStack[i].branch;
        }
        return undefined;
    }

    // Branch efetiva: a da própria linha ou, na falta dela, a da chamada que a originou
    function effectiveBranch(iid, val) {
        return getBranch(iid, val) || stackBranch() || "Base";
    }

    // --- MÉTODOS DE ARRAY QUE ALTERAM O ARRAY NO LUGAR ---
    // Cada posição afetada é uma escrita; para o OA o valor só é conhecido em push e fill.
    var ARRAY_MUTATORS = ["push", "pop", "unshift", "shift", "splice", "fill", "copyWithin", "reverse", "sort"]
        .map(function (name) { return Array.prototype[name]; });

    function range(from, to) {
        var r = [];
        for (var i = from; i < to; i++) r.push(i);
        return r;
    }

    function clampIndex(i, len, dflt) {
        if (i === undefined) return dflt;
        i = Math.trunc(Number(i)) || 0;
        return i < 0 ? Math.max(len + i, 0) : Math.min(i, len);
    }

    function unknownValue() {
        return {};
    }

    function inPlaceArrayWrites(f, base, args) {
        var len = base.length, A = Array.prototype, offsets, start, end;
        var withUnknown = function (list) {
            return list.map(function (i) { return { offset: i, val: unknownValue() }; });
        };

        if (f === A.push) {
            return range(len, len + args.length).map(function (i) { return { offset: i, val: args[i - len] }; });
        }
        if (f === A.pop) return len > 0 ? withUnknown([len - 1]) : [];
        if (f === A.unshift) return withUnknown(range(0, len + args.length));
        if (f === A.shift) return withUnknown(range(0, len));
        if (f === A.splice) {
            if (args.length === 0) return [];
            start = clampIndex(args[0], len, 0);
            var removed = args.length === 1 ? len - start
                : Math.min(Math.max(Math.trunc(Number(args[1])) || 0, 0), len - start);
            var added = Math.max(args.length - 2, 0);
            // Se removeu e inseriu a mesma quantidade, o restante não se desloca
            end = added === removed ? start + added : Math.max(len, len - removed + added);
            return withUnknown(range(start, end));
        }
        if (f === A.fill) {
            start = clampIndex(args[1], len, 0);
            end = clampIndex(args[2], len, len);
            return range(start, end).map(function (i) { return { offset: i, val: args[0] }; });
        }
        if (f === A.copyWithin) {
            var target = clampIndex(args[0], len, 0);
            start = clampIndex(args[1], len, 0);
            end = clampIndex(args[2], len, len);
            var count = Math.min(end - start, len - target);
            return count > 0 ? withUnknown(range(target, target + count)) : [];
        }
        if (f === A.reverse) {
            offsets = range(0, len);
            if (len % 2 === 1) offsets.splice((len - 1) / 2, 1); // o elemento do meio não muda
            return withUnknown(offsets);
        }
        if (f === A.sort) {
            var sorted = base.slice().sort(args[0]);
            return withUnknown(range(0, len).filter(function (i) { return sorted[i] !== base[i]; }));
        }
        return [];
    }

    function differentValues(prev, curr) {
        return prev !== curr;
    }

    function label(target) {
        return labels[target] || target;
    }

    // --- LÓGICA CENTRAL DE ESCRITA (PRODUTOR) ---
    function handleWrite(target, line, branch, val) {
        if (!target || target === 'undefined' || target === 'null') return;

        if (branch !== "Base") {
            var otherBranch = branch === "L" ? "R" : "L";

            // [REGRA OA: Write -> Write sem outra escrita no meio, com valores diferentes]
            var previous = assignments[otherBranch][target];
            if (previous && differentValues(previous.val, val)) {
                var oaMsg = `[CONFLITO OA] Estado '${label(target)}' (atribuído por '${branch}' na linha ${line}) sobrescreveu a atribuição anterior de '${otherBranch}' (linha ${previous.line})!`;
                if (detectedConflicts.overridingAssignments.indexOf(oaMsg) === -1) {
                    detectedConflicts.overridingAssignments.push(oaMsg);
                    console.log(`🚨 ${oaMsg}`);
                }
            }
            // A atribuição da outra branch deixa de valer (Algoritmo 1, linha 7)
            delete assignments[otherBranch][target];
            assignments[branch][target] = { line: line, val: val };

            // [REGRA DATA FLOW: Registro de Escrita do Produtor]
            lastWrite[target] = { branch: branch, line: line };
            console.log(`[ESCRITA] '${label(target)}' modificado pela branch '${branch}' na linha ${line}`);
        } else {
            // [OPERAÇÃO DE KILL PELA BASE]
            // A Base sobrescreve o estado, limpando o rastro de mutações concorrentes
            delete assignments["L"][target];
            delete assignments["R"][target];
            lastWrite[target] = { branch: "Base", line: line };
        }
    }

    // --- LÓGICA CENTRAL DE LEITURA (CONSUMIDOR - DATA FLOW) ---
    function handleRead(target, line, readingBranch) {
        if (!target || target === 'undefined' || target === 'null') return;

        // [REGRA DATA FLOW: Consumo Inter-Branch]
        if (readingBranch !== "Base" && lastWrite[target]) {
            var writingBranch = lastWrite[target].branch;

            // Se o estado foi produzido por uma branch concorrente (L -> R ou R -> L):
            if (writingBranch !== "Base" && writingBranch !== readingBranch) {
                var dfMsg = `[CONFLITO DATA FLOW] Estado '${label(target)}' lido pela branch '${readingBranch}' (linha ${line}), mas foi produzido pela branch '${writingBranch}' (linha ${lastWrite[target].line})!`;

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
            loadBranchMap(map);
            assignments = { "L": {}, "R": {} };
            lastWrite = {};
            callStack = [];
            functionDepth = 0;
            detectedConflicts = { overridingAssignments: [], dataFlows: [] };
        },

        // ==============================================================
        // 0. CHAMADAS DE FUNÇÃO: PILHA DE CHAMADAS (INTERPROCEDURAL)
        // ==============================================================
        invokeFunPre: function (iid, f, base, args, isConstructor, isMethod, functionIid, functionSid) {
            // Métodos de array que alteram o array no lugar escrevem nas posições afetadas
            if (isMethod && Array.isArray(base) && ARRAY_MUTATORS.indexOf(f) !== -1) {
                var line = getLines(iid)[0];
                var branch = effectiveBranch(iid);
                inPlaceArrayWrites(f, base, args).forEach(function (w) {
                    handleWrite(fieldTarget(base, w.offset, false), line, branch, w.val);
                });
            }
            // A branch da chamada é a da linha onde ela termina (Moraes et al., 2024)
            var lines = getLines(iid);
            callStack.push({ branch: lineToBranch[lines[1]], depth: functionDepth });
            return { f: f, base: base, args: args, skip: false };
        },

        invokeFun: function (iid, f, base, args, result, isConstructor, isMethod, functionIid, functionSid) {
            callStack.pop();
            return { result: result };
        },

        // O invokeFun não roda quando a função chamada termina por exceção. A profundidade de funções
        // instrumentadas permite descartar as chamadas que ficaram pendentes na pilha.
        functionEnter: function (iid, f, dis, args) {
            functionDepth++;
        },

        functionExit: function (iid, returnVal, wrappedExceptionVal) {
            // Chamadas feitas por esta função (ou por funções abaixo dela) que não retornaram
            while (callStack.length > 0 && callStack[callStack.length - 1].depth >= functionDepth) {
                callStack.pop();
            }
            // Saída por exceção: a chamada que invocou esta função também não terá invokeFun
            if (wrappedExceptionVal !== undefined && callStack.length > 0
                && callStack[callStack.length - 1].depth === functionDepth - 1) {
                callStack.pop();
            }
            functionDepth--;
        },

        // ==============================================================
        // 1. VARIÁVEIS LOCAIS / GLOBAIS: WRITE
        // ==============================================================
        write: function (iid, name, val, lhs, isGlobal, isScriptLocal) {
            handleWrite(variableTarget(name), getLines(iid)[0], effectiveBranch(iid, val), val);
            return { result: val };
        },

        // ==============================================================
        // 2. VARIÁVEIS LOCAIS / GLOBAIS: READ
        // ==============================================================
        read: function (iid, name, val, isGlobal, isScriptLocal) {
            handleRead(variableTarget(name), getLines(iid)[0], effectiveBranch(iid));
            return { result: val };
        },

        // ==============================================================
        // 3. PROPRIEDADES DE OBJETOS E ARRAYS: PUT FIELD (WRITE)
        // ==============================================================
        putFieldPre: function (iid, base, offset, val, isComputed, isOpAssign) {
            if (!isInternal(base, offset)) {
                handleWrite(fieldTarget(base, offset, false), getLines(iid)[0], effectiveBranch(iid, val), val);
            }
            return { base: base, offset: offset, val: val, skip: false };
        },

        // ==============================================================
        // 4. PROPRIEDADES DE OBJETOS E ARRAYS: GET FIELD (READ)
        // ==============================================================
        getField: function (iid, base, offset, val, isComputed, isOpAssign, isMethodCall) {
            if (!isInternal(base, offset)) {
                handleRead(fieldTarget(base, offset, true), getLines(iid)[0], effectiveBranch(iid));
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
