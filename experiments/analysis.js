(function () {
    var branches = {};

    // --- VARIÁVEIS DA TABELA 2 ---
    var assignments = {
        "L": [],
        "R": []
    };
    var modifiedLinesPerBranch = {
        // Mapeamento dos branches para as linhas modificadas em cada um
        "L": [5],
        "R": [1]
    };

    J$.analysis = {

        // --- CALLBACK DA TABELA 2 ---
        write: function (iid, name, val, lhs, isGlobal, isScriptLocal) {
            const location = J$.iidToLocation(J$.sid, iid);
            const startLine = Number(location.split(':')[1]);
            const modifiedByBranch = modifiedLinesPerBranch["L"].includes(startLine)
                ? "L"
                : (modifiedLinesPerBranch["R"].includes(startLine)
                    ? "R"
                    : undefined);

            if (modifiedByBranch) {
                const otherBranch = modifiedByBranch === "L" ? "R" : "L";

                if (assignments[otherBranch].includes(name)) {
                    console.log(`[CONFLITO SEMÂNTICO DETECTADO] Overriding Assignment: A variável '${name}' (atribuída pelo branch '${modifiedByBranch}' na linha ${startLine}) sobrescreveu a atribuição anterior feita pelo branch '${otherBranch}'!`);
                }

                assignments[modifiedByBranch].push(name);
                console.log(`Variable '${name}' assigned at line ${startLine} by branch '${modifiedByBranch}'`);
            }
            return { result: val };
        },

        conditional: function (iid, result) {
            var id = J$.getGlobalIID(iid);
            var branchInfo = branches[id];
            if (!branchInfo) {
                branchInfo = branches[id] = { trueCount: 0, falseCount: 0 };
            }
            if (result) {
                branchInfo.trueCount++;
            } else {
                branchInfo.falseCount++;
            }
        },

        endExecution: function () {
            for (var id in branches) {
                if (branches.hasOwnProperty(id)) {
                    var branchInfo = branches[id];
                    var location = J$.iidToLocation(id);
                    console.log("At location " + location +
                        " 'true' branch was taken " + branchInfo.trueCount +
                        " time(s) and 'false' branch was taken " + branchInfo.falseCount + " time(s).");
                }
            }
        }
    };
}());
