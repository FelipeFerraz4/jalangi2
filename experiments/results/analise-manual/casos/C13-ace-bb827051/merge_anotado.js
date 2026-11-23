define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var MultiHashHandler = require("../keyboard/hash_handler").MultiHashHandler;                // [R]
var EventEmitter = require("../lib/event_emitter").EventEmitter;

/**
 * @class CommandManager
 *
 **/

/**
 * new CommandManager(platform, commands)
 * @param {String} platform Identifier for the platform; must be either `"mac"` or `"win"`  // [L=R]
 * @param {Array} commands A list of commands
 *
 **/

var CommandManager = function(platform, commands) {
    MultiHashHandler.call(this, commands, platform);                                        // [R]
    this.byName = this.commands;
    this.setDefaultHandler("exec", function(e) {
        return e.command.exec(e.editor, e.args || {});                                      // ◀ #1 DF: produz (R) (herdou R pela chamada na linha 52) → L 42
    });
};

oop.inherits(CommandManager, MultiHashHandler);                                             // [R]

(function() {

    oop.implement(this, EventEmitter);

    this.exec = function(command, editor, args) {
        if (Array.isArray(command)) {                                                       // [R]
            for (var i = command.length; i--; ) {                                           // [R]
                if (this.exec(command[i], editor, args)) return true;                       // [R]
            }                                                                               // [R]
            return false;                                                                   // [R]
        }                                                                                   // [R]
                                                                                            // [R]
        if (typeof command === "string")                                                    // [L=R]  ◀ #1 DF: consome (L) ← R 24  ◀ #2 DF: consome (L) ← R 52  ◀ #3 DF: consome (L) ← R 79  … (+2 conflitos nesta linha)
            command = this.commands[command];

        if (!command)
            return false;

        if (editor && editor.$readOnly && !command.readOnly)
            return false;

        var e = {editor: editor, command: command, args: args};
        e.returnValue = this._emit("exec", e);                                              // [R]  ◀ #2 DF: produz (R) → L 42
        this._signal("afterExec", e);

        return e.returnValue === false ? false : true;                                      // [R]
    };

    this.toggleRecording = function(editor) {
        if (this.$inReplay)
            return;

        editor && editor._emit("changeStatus");
        if (this.recording) {
            this.macro.pop();
            this.removeEventListener("exec", this.$addCommandToMacro);

            if (!this.macro.length)
                this.macro = this.oldMacro;

            return this.recording = false;
        }
        if (!this.$addCommandToMacro) {
            this.$addCommandToMacro = function(e) {
                this.macro.push([e.command, e.args]);
            }.bind(this);
        }

        this.oldMacro = this.macro;
        this.macro = [];                                                                    // ◀ #3 DF: produz (R) (herdou R pela chamada na linha 52) → L 42
        this.on("exec", this.$addCommandToMacro);
        return this.recording = true;
    };

    this.replay = function(editor) {
        if (this.$inReplay || !this.macro)
            return;

        if (this.recording)
            return this.toggleRecording(editor);

        try {
            this.$inReplay = true;
            this.macro.forEach(function(x) {                                                // ◀ #4 DF: produz (R) (herdou R pela chamada na linha 52) → L 42
                if (typeof x == "string")
                    this.exec(x, editor);
                else
                    this.exec(x[0], editor, x[1]);                                          // ◀ #5 DF: produz (R) (herdou R pela chamada na linha 52) → L 42
            }, this);
        } finally {
            this.$inReplay = false;
        }
    };

    this.trimMacro = function(m) {
        return m.map(function(x){
            if (typeof x[0] != "string")
                x[0] = x[0].name;
            if (!x[1])
                x = x[0];
            return x;
        });
    };

}).call(CommandManager.prototype);

exports.CommandManager = CommandManager;

});

// ─────────────────────────────────────────────────────────────────────────────
// Legenda (merge_anotado.js; a numeração das linhas é a mesma do merge.js e do README):
//   [L] / [R]   linha alterada por aquele lado        [L=R]  igual nos dois lados (o mapa conta como L)
//   ◀ #n        papel da linha no conflito n do README.md; "herdou" = a linha não foi alterada por aquele
//               lado e pegou a branch da chamada indicada (regra interprocedural da análise)
