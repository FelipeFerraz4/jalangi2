(function () {
    // =========================================================================
    // MOTOR DE ANÁLISE DINÂMICA DE MERGE (Jalangi2): OA, DATA FLOW E CONFLUENCE FLOW
    // =========================================================================
    // Expansão da técnica de Amanda Moraes (SBLP 2024) para detecção de Data Flow e
    // Confluence Flow conforme formalizados por Santos, Borba, Bonifácio e Barbosa (2023).
    // Uma única execução detecta os três tipos de interferência. Data Flow e Confluence Flow
    // saem separados em diretos (o valor veio direto da escrita) e transitivos (o valor
    // passou por outros valores antes de chegar ao uso).
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

    // --- ESTADO DO DATA FLOW ---
    // origins[target] = lista de origens do valor atual do elemento de estado. Cada origem é
    //   { branch, line, derived, viaParam }
    //   derived:  false se a escrita da branch produziu o valor; true se ele chegou por outros valores
    //             (x -> y -> uso de y), que é o fluxo transitivo (Tainted)
    //   viaParam: o valor entrou na função por parâmetro
    var origins = {};

    // Origens lidas na expressão em andamento, ainda não atribuídas a nenhum alvo.
    // A pilha guarda as da função chamadora enquanto a chamada executa.
    var pending = [];
    var pendingStack = [];
    var entryTaint = [];

    // Rótulos legíveis dos alvos (a chave interna usa ids da memória sombra)
    var labels = {};

    // --- PILHA DE CHAMADAS ---
    // Guarda a branch de cada chamada em andamento (undefined = chamada de linha da Base) e a
    // profundidade de funções instrumentadas em que ela foi feita.
    // Código executado dentro de uma função chamada por L ou R é atribuído a essa branch.
    var callStack = [];
    var functionDepth = 0;

    function emptyReport() {
        return {
            overridingAssignments: [],
            dataFlowsDirect: [], dataFlowsTransitive: [],           // pares "L@linha->R@linha"
            confluencesDirect: [], confluencesTransitive: []        // trios "linhaL|linhaR@linhaBase"
        };
    }
    var detectedConflicts = emptyReport();

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

    function originKey(o) {
        return o.branch + '|' + o.line + '|' + !!o.derived + '|' + !!o.viaParam;
    }

    function mergeOrigins(a, b) {
        var result = a.slice();
        var seen = {};
        result.forEach(function (o) { seen[originKey(o)] = true; });
        b.forEach(function (o) {
            if (!seen[originKey(o)]) {
                seen[originKey(o)] = true;
                result.push(o);
            }
        });
        return result;
    }

    // O valor passou por outro valor: deixa de ser direto
    function asDerived(list) {
        return list.map(function (o) {
            return { branch: o.branch, line: o.line, derived: true, viaParam: o.viaParam };
        });
    }

    // --- CONFLUENCE FLOW ---
    // Um comando da Base que usa, ao mesmo tempo, valores produzidos por L e por R é um ponto de
    // confluência: o par (linha de L, linha de R) chega ao mesmo uso sem que nenhuma das duas
    // contribuições o tenha escrito (Santos et al., 2023). Conta-se o trio (L, R, comando).
    // É direto quando os dois valores vieram direto das escritas, e transitivo quando algum passou
    // por outro valor.
    function reportConfluence(line) {
        // Valores que entraram por parâmetro não contam dentro da função: a confluência é do corpo onde os
        // dois valores se encontram, e o ponto da chamada já a reporta (cada corpo é analisado sozinho no Java)
        var sources = pending.filter(function (o) { return o.branch === "L" && !o.viaParam; });
        var sinks = pending.filter(function (o) { return o.branch === "R" && !o.viaParam; });
        sources.forEach(function (source) {
            sinks.forEach(function (sink) {
                var key = source.line + '|' + sink.line + '@' + line;
                var direct = !source.derived && !sink.derived;
                var list = direct ? detectedConflicts.confluencesDirect : detectedConflicts.confluencesTransitive;
                if (list.indexOf(key) === -1) {
                    list.push(key);
                    console.log(`\n🔀 [CONFLITO CONFLUENCE${direct ? '' : ' TRANSITIVO'}] Os valores produzidos por 'L' (linha ${source.line}) e por 'R' (linha ${sink.line}) confluem no comando da Base na linha ${line}!\n`);
                }
            });
        });
    }

    // --- LÓGICA CENTRAL DE ESCRITA (PRODUTOR) ---
    function handleWrite(target, line, branch, val) {
        if (!target || target === 'undefined' || target === 'null') return;

        if (branch === "Base") reportConfluence(line);

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
            // A escrita produz o valor diretamente; o que foi lido para calculá-lo chega de forma transitiva
            origins[target] = mergeOrigins([{ branch: branch, line: line, derived: false }], asDerived(pending));
            console.log(`[ESCRITA] '${label(target)}' modificado pela branch '${branch}' na linha ${line}`);
        } else {
            // [OPERAÇÃO DE KILL PELA BASE]
            // A Base sobrescreve o estado: não sobra origem direta, só a dos valores lidos para calculá-lo
            delete assignments["L"][target];
            delete assignments["R"][target];
            origins[target] = asDerived(pending);
        }
        pending = [];
    }

    // --- PASSAGEM DE PARÂMETROS (PRODUTOR - DATA FLOW) ---
    // Ligar um argumento ao parâmetro produz um valor na branch do ponto de chamada. Conta apenas
    // para o Data Flow: o OA considera atribuições explícitas no código (Moraes et al., 2024).
    // O que foi lido nos argumentos chega ao parâmetro de forma transitiva.
    function handleParameterBinding(target, line, branch) {
        var produced = branch !== "Base" ? [{ branch: branch, line: line, derived: false }] : [];
        origins[target] = mergeOrigins(produced, asDerived(entryTaint)).map(function (o) {
            return { branch: o.branch, line: o.line, derived: o.derived, viaParam: true };
        });
        if (branch !== "Base") {
            console.log(`[PARÂMETRO] '${label(target)}' recebe valor da branch '${branch}' (chamada na linha ${line})`);
        }
    }

    // --- LÓGICA CENTRAL DE LEITURA (CONSUMIDOR - DATA FLOW) ---
    function handleRead(target, line, readingBranch) {
        if (!target || target === 'undefined' || target === 'null') return;

        var produced = origins[target] || [];

        // [REGRA DATA FLOW: Consumo Inter-Branch]
        if (readingBranch !== "Base") {
            produced.forEach(function (origin) {
                // Se o estado foi produzido por uma branch concorrente (L -> R ou R -> L):
                if (origin.branch !== readingBranch) {
                    // Um conflito é o par (linha que produz, linha que consome), como o par source/sink do Java:
                    // vários elementos de estado entre as mesmas duas linhas contam uma vez
                    var pair = origin.branch + '@' + origin.line + '->' + readingBranch + '@' + line;
                    var list = origin.derived ? detectedConflicts.dataFlowsTransitive : detectedConflicts.dataFlowsDirect;
                    if (list.indexOf(pair) === -1) {
                        list.push(pair);
                        console.log(`\n⚡ [CONFLITO DATA FLOW${origin.derived ? ' TRANSITIVO' : ''}] Estado '${label(target)}' lido pela branch '${readingBranch}' (linha ${line}), mas foi produzido pela branch '${origin.branch}' (linha ${origin.line})!`);
                        console.log(`   └─> Risco Semântico: Branch '${readingBranch}' está consumindo estado mutado concorrentemente por '${origin.branch}'.\n`);
                    }
                }
            });
        }

        // O valor lido leva suas origens para o que for atribuído com ele
        pending = mergeOrigins(pending, produced);
    }

    J$.analysis = {
        // Função para configurar programaticamente as linhas das branches
        setBranches: function (map) {
            loadBranchMap(map);
            assignments = { "L": {}, "R": {} };
            origins = {};
            pending = [];
            pendingStack = [];
            entryTaint = [];
            callStack = [];
            functionDepth = 0;
            detectedConflicts = emptyReport();
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
            callStack.push({ branch: lineToBranch[lines[1]], depth: functionDepth, line: lines[0] });
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
            // O que foi lido nos argumentos contamina os parâmetros; o corpo começa limpo
            pendingStack.push(pending);
            entryTaint = pending;
            pending = [];
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
            // O valor devolvido leva as origens lidas no return para a expressão do chamador.
            // De volta ao chamador, as origens voltam a valer no corpo dele
            pending = mergeOrigins(pendingStack.pop() || [], pending.map(function (o) {
                return { branch: o.branch, line: o.line, derived: o.derived };
            }));
        },

        // Fim de um comando: o que foi lido não alimenta mais nenhuma atribuição
        endExpression: function (iid) {
            if (effectiveBranch(iid) === "Base") reportConfluence(getLines(iid)[0]);
            pending = [];
        },

        conditional: function (iid, result) {
            if (effectiveBranch(iid) === "Base") reportConfluence(getLines(iid)[0]);
            pending = [];
            return { result: result };
        },

        // Parâmetros: o valor vem da chamada que está sendo executada, empilhada pelo chamador
        // na profundidade logo abaixo da atual (chamadas implícitas, como getters, não têm entrada).
        declare: function (iid, name, val, isArgument, argumentIndex, isCatchParam) {
            var call = callStack[callStack.length - 1];
            if (isArgument && name !== 'arguments' && call && call.depth === functionDepth - 1) {
                handleParameterBinding(variableTarget(name), call.line, stackBranch() || "Base");
            }
            return { result: val };
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
            // Um conflito transitivo só conta se o mesmo conflito não aparece também como direto
            var onlyTransitive = function (transitive, direct) {
                return transitive.filter(function (k) { return direct.indexOf(k) === -1; }).length;
            };
            var df = {
                direct: detectedConflicts.dataFlowsDirect.length,
                transitive: onlyTransitive(detectedConflicts.dataFlowsTransitive, detectedConflicts.dataFlowsDirect)
            };
            var cf = {
                direct: detectedConflicts.confluencesDirect.length,
                transitive: onlyTransitive(detectedConflicts.confluencesTransitive, detectedConflicts.confluencesDirect)
            };
            console.log("\n==================================================");
            console.log("📊 RELATÓRIO FINAL DE ANÁLISE DINÂMICA DE MERGE");
            console.log(`   - Conflitos de Overriding Assignment (OA): ${detectedConflicts.overridingAssignments.length}`);
            console.log(`   - Conflitos de Data Flow (DF):             ${df.direct + df.transitive}`);
            console.log(`   - Conflitos de Confluence Flow (CF):       ${cf.direct + cf.transitive}`);
            console.log("==================================================");
            // Os runners de teste comparam cada análise do Java com um recorte (direto ou direto + transitivo)
            if (typeof process !== 'undefined' && process.env && process.env.ANALYSIS_DETAIL) {
                console.log("DETALHE " + JSON.stringify({ dfDireto: df.direct, dfTransitivo: df.transitive, cfDireto: cf.direct, cfTransitivo: cf.transitive }));
            }
        }
    };
}());
