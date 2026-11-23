/*
 * common.js: Internal helper and utility functions for winston
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var util = require('util'),
    crypto = require('crypto'),
    cycle = require('cycle'),
    fs = require('fs'),                                                                        // [L]
    config = require('./config');

//
// ### function setLevels (target, past, current)
// #### @target {Object} Object on which to set levels.
// #### @past {Object} Previous levels set on target.
// #### @current {Object} Current levels to set on target.
// Create functions on the target objects for each level
// in current.levels. If past is defined, remove functions
// for each of those levels.
//
exports.setLevels = function (target, past, current, isDefault) {
  var self = this;                                                                             // [L]
  if (past) {
    Object.keys(past).forEach(function (level) {
      delete target[level];
    });
  }

  target.levels = current || config.npm.levels;
  if (target.padLevels) {
    target.levelLength = exports.longestElement(Object.keys(target.levels));
  }

  //
  //  Define prototype methods for each log level
  //  e.g. target.log('info', msg) <=> target.info(msg)
  //
  Object.keys(target.levels).forEach(function (level) {
                                                                                               // [L]
    // TODO Refactor logging methods into a different object to avoid name clashes             // [L]
    if (level === 'log') {                                                                     // [L]
      console.warn('Log level named "log" will clash with the method "log". Consider using a different name.');  // [L]
      return;                                                                                  // [L]
    }                                                                                          // [L]
                                                                                               // [L]
    target[level] = function (msg) {
      // build argument list (level, msg, ... [string interpolate], [{metadata}], [callback])
      var args = [level].concat(Array.prototype.slice.call(arguments));
      target.log.apply(target, args);
    };
  });

  return target;
};

//
// ### function longestElement
// #### @xs {Array} Array to calculate against
// Returns the longest element in the `xs` array.
//
exports.longestElement = function (xs) {
  return Math.max.apply(
    null,
    xs.map(function (x) { return x.length; })
  );
};

//
// ### function clone (obj)
// #### @obj {Object} Object to clone.
// Helper method for deep cloning pure JSON objects
// i.e. JSON objects that are either literals or objects (no Arrays, etc)
//
exports.clone = function (obj) {
  //                                                                                           // [L]
  // We only need to clone refrence types (Object)                                             // [L]
  //                                                                                           // [L]
  if (obj instanceof Error) {                                                                  // [L]
    return obj;                                                                                // [L]
  }                                                                                            // [L]
  else if (!(obj instanceof Object)) {                                                         // [L]
    return obj;
  }
  else if (obj instanceof Date) {
    return obj;
  }

  var copy = {};                                                                               // ◀ #1 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 260  ◀ #2 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 263  ◀ #3 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 266  … (+9 conflitos nesta linha)
  for (var i in obj) {                                                                         // ◀ #13 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 260  ◀ #14 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 263  ◀ #15 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 266  … (+17 conflitos nesta linha)
    if (Array.isArray(obj[i])) {
      copy[i] = obj[i].slice(0);                                                               // ◀ #33 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 260  ◀ #34 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 263  ◀ #35 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 266  … (+9 conflitos nesta linha)
    }
    else if (obj[i] instanceof Buffer) {
        copy[i] = obj[i].slice(0);
    }
    else if (typeof obj[i] != 'function') {
      copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];                     // ◀ #45 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 260  ◀ #46 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 263  ◀ #47 DF: produz (L) (linha não alterada por L: herdou a branch de um comando de várias linhas ou de uma chamada não registrada; procure a linha [L] mais próxima no merge_anotado.js) → R 266  … (+12 conflitos nesta linha)
    }
    else if (typeof obj[i] === 'function') {
      copy[i] = obj[i];
    }
  }

  return copy;
};

//
// ### function log (options)
// #### @options {Object} All information about the log serialization.
// Generic logging function for returning timestamped strings
// with the following options:
//
//    {
//      level:     'level to add to serialized message',
//      message:   'message to serialize',
//      meta:      'additional logging metadata to serialize',
//      colorize:  false, // Colorizes output (only if `.json` is false)
//      timestamp: true   // Adds a timestamp to the serialized message
//      label:     'label to prepend the message'
//    }
//
exports.log = function (options) {
  var timestampFn = typeof options.timestamp === 'function'
        ? options.timestamp
        : exports.timestamp,
      timestamp   = options.timestamp ? timestampFn() : null,
      meta        = options.meta !== null && options.meta !== undefined && !(options.meta instanceof Error)  // [L]  ◀ #60 DF: produz (L) → R 214  ◀ #61 CF: valor de L  ◀ #62 DF: produz (L) → R 260  … (+20 conflitos nesta linha)
        ? exports.clone(cycle.decycle(options.meta))                                           // [L]  ◀ #83 DF: produz (L) → R 260  ◀ #84 DF: produz (L) → R 263  ◀ #85 DF: produz (L) → R 266  … (+17 conflitos nesta linha)
        : options.meta || null,                                                                // [L]
      output;

  //
  // raw mode is intended for outputing winston as streaming JSON to STDOUT
  //
  if (options.raw) {
    if (typeof meta !== 'object' && meta != null) {
      meta = { meta: meta };
    }
    output         = exports.clone(meta) || {};
    output.level   = options.level;
    output.message = options.message.stripColors;
    return JSON.stringify(output);
  }

  //
  // json mode is intended for pretty printing multi-line json to the terminal
  //
  if (options.json || true === options.logstash) {                                             // [L]
    if (typeof meta !== 'object' && meta != null) {
      meta = { meta: meta };
    }

    output         = exports.clone(meta) || {};
    output.level   = options.level;
    output.message = options.message;
    if (options.label) {                                                                       // [L]
      output.label = options.label;                                                            // [L]
    }                                                                                          // [L]
    if (timestamp) {
      output.timestamp = timestamp;
    }

    if (options.logstash === true) {
      // use logstash format
      var logstashOutput = {};
      if (output.message !== undefined) {
        logstashOutput['@message'] = output.message;
        delete output.message;
      }

      if (output.timestamp !== undefined) {
        logstashOutput['@timestamp'] = output.timestamp;
        delete output.timestamp;
      }

      logstashOutput['@fields'] = exports.clone(output);
      output = logstashOutput;
    }

    if (typeof options.stringify === 'function') {
      return options.stringify(output);
    }

    return JSON.stringify(output, function (key, value) {
      return value instanceof Buffer
        ? value.toString('base64')
        : value;
    });
  }

  output = timestamp ? timestamp + ' - ' : '';
  output += options.colorize ? config.colorize(options.level) : options.level;
  output += ': ';
  output += options.label ? ('[' + options.label + '] ') : '';
  output += options.message;

  if (meta !== null && meta !== undefined) {
    if (meta && meta instanceof Error && meta.stack) {
      meta = meta.stack;
    }

    if (typeof meta !== 'object') {
      output += ' ' + meta;
    }
    else if (Object.keys(meta).length > 0) {
      if (typeof options.prettyPrint === 'function') {                                         // [R]
        output += ' ' + options.prettyPrint(meta);                                             // [R]
      } else if (options.prettyPrint) {                                                        // [R]
        output += ' ' + '\n' + util.inspect(meta, false, null, options.colorize);              // [R]
      } else {                                                                                 // [R]
        output += ' ' + exports.serialize(meta);                                               // [R]  ◀ #60 DF: consome (R) ← L 130  ◀ #61 CF: valor de R
      }                                                                                        // [R]
    }
  }

  return output;                                                                               // ◀ #61 CF: confluência (L 130 + R 214)
};

exports.capitalize = function (str) {
  return str && str[0].toUpperCase() + str.slice(1);
};

//
// ### function hash (str)
// #### @str {string} String to hash.
// Utility function for creating unique ids
// e.g. Profiling incoming HTTP requests on the same tick
//
exports.hash = function (str) {
  return crypto.createHash('sha1').update(str).digest('hex');
};

//
// ### function pad (n)
// Returns a padded string if `n < 10`.
//
exports.pad = function (n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
};

//
// ### function timestamp ()
// Returns a timestamp string for the current time.
//
exports.timestamp = function () {
  return new Date().toISOString();
};

//
// ### function serialize (obj, key)
// #### @obj {Object|literal} Object to serialize
// #### @key {string} **Optional** Optional key represented by obj in a larger object
// Performs simple comma-separated, `key=value` serialization for Loggly when
// logging to non-JSON inputs.
//
exports.serialize = function (obj, key) {
  if (obj === null) {                                                                          // ◀ #1 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #13 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #33 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+3 conflitos nesta linha)
    obj = 'null';
  }
  else if (obj === undefined) {                                                                // ◀ #2 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #14 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #34 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+3 conflitos nesta linha)
    obj = 'undefined';
  }
  else if (obj === false) {                                                                    // ◀ #3 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #15 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #35 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+3 conflitos nesta linha)
    obj = 'false';
  }

  if (typeof obj !== 'object') {                                                               // ◀ #4 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #16 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #36 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+3 conflitos nesta linha)
    return key ? key + '=' + obj : obj;                                                        // ◀ #5 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #17 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #37 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+3 conflitos nesta linha)
  }

  if (obj instanceof Buffer) {                                                                 // ◀ #18 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #50 DF: consome (R) (herdou R pela chamada na linha 214) ← L 100  ◀ #67 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130  … (+1 conflitos nesta linha)
    return key ? key + '=' + obj.toString('base64') : obj.toString('base64');
  }

  var msg = '',
      keys = Object.keys(obj),                                                                 // ◀ #19 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #51 DF: consome (R) (herdou R pela chamada na linha 214) ← L 100  ◀ #68 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130  … (+1 conflitos nesta linha)
      length = keys.length;                                                                    // ◀ #20 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #52 DF: consome (R) (herdou R pela chamada na linha 214) ← L 100  ◀ #69 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130  … (+1 conflitos nesta linha)

  for (var i = 0; i < length; i++) {                                                           // ◀ #21 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #53 DF: consome (R) (herdou R pela chamada na linha 214) ← L 100  ◀ #70 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130  … (+1 conflitos nesta linha)
    if (Array.isArray(obj[keys[i]])) {                                                         // ◀ #6 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #22 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #38 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+3 conflitos nesta linha)
      msg += keys[i] + '=[';                                                                   // ◀ #72 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130

      for (var j = 0, l = obj[keys[i]].length; j < l; j++) {                                   // ◀ #7 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #23 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #39 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+2 conflitos nesta linha)
        msg += exports.serialize(obj[keys[i]][j]);                                             // ◀ #8 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #24 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #40 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+2 conflitos nesta linha)
        if (j < l - 1) {                                                                       // ◀ #9 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #25 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #41 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+2 conflitos nesta linha)
          msg += ', ';                                                                         // ◀ #10 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #26 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #42 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+2 conflitos nesta linha)
        }
      }

      msg += ']';                                                                              // ◀ #11 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #27 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #43 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+2 conflitos nesta linha)
    }
    else if (obj[keys[i]] instanceof Date) {                                                   // ◀ #28 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #55 DF: consome (R) (herdou R pela chamada na linha 214) ← L 100  ◀ #78 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130  … (+1 conflitos nesta linha)
      msg += keys[i] + '=' + obj[keys[i]];
    }
    else {
      msg += exports.serialize(obj[keys[i]], keys[i]);                                         // ◀ #29 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #56 DF: consome (R) (herdou R pela chamada na linha 214) ← L 100  ◀ #79 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130  … (+1 conflitos nesta linha)
    }

    if (i < length - 1) {                                                                      // ◀ #30 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #57 DF: consome (R) (herdou R pela chamada na linha 214) ← L 100  ◀ #80 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130  … (+1 conflitos nesta linha)
      msg += ', ';                                                                             // ◀ #31 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #58 DF: consome (R) (herdou R pela chamada na linha 214) ← L 100  ◀ #81 DF: consome (R) (herdou R pela chamada na linha 214) ← L 130  … (+1 conflitos nesta linha)
    }
  }

  return msg;                                                                                  // ◀ #12 DF: consome (R) (herdou R pela chamada na linha 214) ← L 91  ◀ #32 DF: consome (R) (herdou R pela chamada na linha 214) ← L 92  ◀ #44 DF: consome (R) (herdou R pela chamada na linha 214) ← L 94  … (+3 conflitos nesta linha)
};
                                                                                               // [L]
                                                                                               // [L]
//                                                                                             // [L]
// ### function tailFile (options, callback)                                                   // [L]
// #### @options {Object} Options for tail.                                                    // [L]
// #### @callback {function} Callback to execute on every line.                                // [L]
// `tail -f` a file. Options must include file.                                                // [L]
//                                                                                             // [L]
exports.tailFile = function tail(options, callback) {                                          // [L]
  var stream = fs.createReadStream(options.file, { encoding: 'utf8' }),                        // [L]
      buff = '',                                                                               // [L]
      destroy,                                                                                 // [L]
      row = 0;                                                                                 // [L]
                                                                                               // [L]
  destroy = stream.destroy.bind(stream);                                                       // [L]
  stream.destroy = function () {};                                                             // [L]
                                                                                               // [L]
  if (options.start === -1) {                                                                  // [L]
    delete options.start;                                                                      // [L]
  }                                                                                            // [L]
                                                                                               // [L]
  stream.on('data', function (data) {                                                          // [L]
    var data = (buff + data).split(/\n+/),                                                     // [L]
        l = data.length - 1,                                                                   // [L]
        i = 0;                                                                                 // [L]
                                                                                               // [L]
    for (; i < l; i++) {                                                                       // [L]
      if (options.start == null || row > options.start) {                                      // [L]
        callback(null, data[i]);                                                               // [L]
      }                                                                                        // [L]
      row++;                                                                                   // [L]
    }                                                                                          // [L]
                                                                                               // [L]
    buff = data[l];                                                                            // [L]
  });                                                                                          // [L]
                                                                                               // [L]
  stream.on('error', function (err) {                                                          // [L]
    callback(err);                                                                             // [L]
    destroy();                                                                                 // [L]
  });                                                                                          // [L]
                                                                                               // [L]
  stream.on('end', function () {                                                               // [L]
    if (buff) {                                                                                // [L]
      stream.emit('line', buff);                                                               // [L]
      buff = '';                                                                               // [L]
    }                                                                                          // [L]
                                                                                               // [L]
    resume();                                                                                  // [L]
  });                                                                                          // [L]
                                                                                               // [L]
  function resume() {                                                                          // [L]
    setTimeout(function () {                                                                   // [L]
      stream.resume();                                                                         // [L]
    }, 1000);                                                                                  // [L]
  }                                                                                            // [L]
                                                                                               // [L]
  return destroy;                                                                              // [L]
};                                                                                             // [L]

// ─────────────────────────────────────────────────────────────────────────────
// Legenda (merge_anotado.js; a numeração das linhas é a mesma do merge.js e do README):
//   [L] / [R]   linha alterada por aquele lado        [L=R]  igual nos dois lados (o mapa conta como L)
//   ◀ #n        papel da linha no conflito n do README.md; "herdou" = a linha não foi alterada por aquele
//               lado e pegou a branch da chamada indicada (regra interprocedural da análise)
