#!/usr/bin/env node
var fs = require('fs'),
    sys = require('util'),                                                                         // [L]  ◀ #1 DF: produz (L) → R 283
    childProcess = require('child_process'),
    dirs = [],                                                                                     // [R]
    path = require('path'),
    spawn = childProcess.spawn,
    meta = JSON.parse(fs.readFileSync(__dirname + '/package.json')),
    exec = childProcess.exec,
    flag = './.monitor',
    nodeArgs = process.argv.splice(2), // removes 'node' and this script                           // [L]  ◀ #2 DF: produz (L) → R 183  ◀ #3 DF: produz (L) → R 184  ◀ #4 DF: produz (L) → R 186  … (+6 conflitos nesta linha)
    app = nodeArgs[0],
    node = null, 
    monitor = null,
    ignoreFilePath = './.nodemonignore',
    oldIgnoreFilePath = './nodemon-ignore',
    ignoreFiles = [],
    reIgnoreFiles = null,
    timeout = 1000, // check every 1 second
    restartDelay = 0, // controlled through arg --delay 10 (for 10 seconds)
    restartTimer = null,
    // create once, reuse as needed
    reEscComments = /\\#/g,
    reUnescapeComments = /\^\^/g, // note that '^^' is used in place of escaped comments
    reComments = /#.*$/,
    reTrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g,
    reEscapeChars = /[.|\-[\]()\\]/g,
    reAsterisk = /\*/g;

function startNode() {
  sys.log('\x1B[32m[nodemon] starting node\x1B[0m');

  var ext = path.extname(app);
  
  if (ext === '.coffee') {
    //coffeescript requires --nodejs --debug
    var debugIndex = nodeArgs.indexOf('--debug');
    if (debugIndex >= 0) {
      nodeArgs.splice(debugIndex, 0, '--nodejs');
    }
    node = spawn('coffee', nodeArgs);
  } else {
    node = spawn('node', nodeArgs);
  }
  
  node.stdout.on('data', function (data) {
    sys.print(data);
  });

  node.stderr.on('data', function (data) {
    sys.error(data);
  });

  node.on('exit', function (code, signal) {
    // exit the monitor, but do it gracefully
    if (signal == 'SIGUSR2') {
      // restart
      startNode();
    } else {
      sys.log('\x1B[1;31m[nodemon] app crashed - waiting for file change before starting...\x1B[0m');
      node = null;
    }
  });
}

function startMonitor() {

  var cmds = [];                                                                                   // [R]
  dirs.forEach(function(dir) {                                                                     // [R]
    cmds.push('find -L ' + dir + ' -type f -newer ' + dir + '/' + flag + ' -print');               // [R]
  });                                                                                              // [R]
                                                                                                   // [R]
  exec(cmds.join(';'), function (error, stdout, stderr) {                                          // [R]
    var files = stdout.split(/\n/);

    files.pop(); // remove blank line ending and split
    if (files.length) {
      // filter ignored files
      if (ignoreFiles.length) {
        files = files.filter(function(file) {
          return !reIgnoreFiles.test(file);
        });
      }

      dirs.forEach(function(dir) {                                                                 // [R]
        fs.writeFileSync(dir + '/' + flag, '');                                                    // [R]
      });                                                                                          // [R]

      if (files.length) {
        if (restartTimer !== null) clearTimeout(restartTimer);
        
        restartTimer = setTimeout(function () {
          sys.log('[nodemon] restarting due to changes...');
          files.forEach(function (file) {
            sys.log('[nodemon] ' + file);
          });
          sys.print('\n\n');

          if (node !== null) {
            node.kill('SIGUSR2');
          } else {
            startNode();
          }          
        }, restartDelay);
      }
    }
    
    setTimeout(startMonitor, timeout);
  });
}

function addIgnoreRule(line, noEscape) {
  // remove comments and trim lines
  // this mess of replace methods is escaping "\#" to allow for emacs temp files
  if (!noEscape) {
    if (line = line.replace(reEscComments, '^^').replace(reComments, '').replace(reUnescapeComments, '#').replace(reTrim, '')) {
       ignoreFiles.push(line.replace(reEscapeChars, '\\$&').replace(reAsterisk, '.*'));
    }    
  } else if (line = line.replace(reTrim, '')) {
    ignoreFiles.push(line);
  }
  reIgnoreFiles = new RegExp(ignoreFiles.join('|'));
}

function readIgnoreFile(curr, prev) {                                                              // [L]
  // unless the ignore file was actually modified, do no re-read it                                // [L]
  if(curr && prev && curr.mtime.valueOf() === prev.mtime.valueOf()) return;                        // [L]
                                                                                                   // [L]
  fs.unwatchFile(ignoreFilePath);

  // Check if ignore file still exists. Vim tends to delete it before replacing with changed file
  path.exists(ignoreFilePath, function(exists) {
    // if (!exists) {
      // we'll touch the ignore file to make sure it gets created and
      // if Vim is writing the file, it'll just overwrite it - but also
      // prevent from constant file io if the file doesn't exist
      // fs.writeFileSync(ignoreFilePath, "\n");
      // setTimeout(readIgnoreFile, 500);
      // return;
    // }
    
    sys.log('[nodemon] reading ignore list');
    
    // ignoreFiles = ignoreFiles.concat([flag, ignoreFilePath]);
    addIgnoreRule(flag);
    addIgnoreRule(ignoreFilePath);
    fs.readFileSync(ignoreFilePath).toString().split(/\n/).forEach(function (rule, i) {            // [L]
      addIgnoreRule(rule);                                                                         // [L]
    });                                                                                            // [L]
    fs.watchFile(ignoreFilePath, { persistent: false }, readIgnoreFile);
  });
}

function usage() {
  sys.print([
    'usage: nodemon [options] [script.js] [args]',
    'e.g.: nodemon script.js localhost 8080',
    '',
    'Options:',
    '  --js               monitor only JavaScript file changes',
    '                     (default if ignore file not found)',
    '  -d n, --delay n    throttle restart for "n" seconds',
    '  -w d, --watch d    watch directory "d". use once for each directory to watch',              // [R]
    '  --debug            enable node\'s native debug port',
    '  -v, --version      current nodemon version',
    '  -h, --help         this usage',
    '',
    'Note: if the script is omitted, nodemon will try "main" from package.json',
    '',
    'For more details see http://github.com/remy/nodemon/\n'
  ].join('\n'));
}

//if conf is a string it specifies the option name.                                                // [R]
//if conf is an object it may have the following properties:                                       // [R]
//  label - the option name                                                                        // [R]
//  multi - if set, look for multiple instances of the option                                      // [R]
function controlArg(nodeArgs, conf, fn) {                                                          // [R]
  var label,                                                                                       // [R]
      multi = false,                                                                               // [R]
      i;                                                                                           // [R]

  if (typeof conf === 'string') {                                                                  // [R]  ◀ #2 DF: consome (R) ← L 11
    label = conf;                                                                                  // [R]  ◀ #3 DF: consome (R) ← L 11
  } else {                                                                                         // [R]
    label = conf.label;                                                                            // [R]  ◀ #4 DF: consome (R) ← L 11
    multi = conf.multi;                                                                            // [R]  ◀ #5 DF: consome (R) ← L 11
  }                                                                                                // [R]
                                                                                                   // [R]
  do {                                                                                             // [R]
    if ((i = nodeArgs.indexOf(label)) !== -1) {                                                    // ◀ #6 DF: consome (R) (herdou R pela chamada na linha 231) ← L 11
      fn(nodeArgs[i], i);
    } else if ((i = nodeArgs.indexOf('-' + label.substr(0, 1))) !== -1) {                          // ◀ #7 DF: consome (R) (herdou R pela chamada na linha 231) ← L 11
      fn(nodeArgs[i], i);
    } else if ((i = nodeArgs.indexOf('--' + label)) !== -1) {                                      // ◀ #8 DF: consome (R) (herdou R pela chamada na linha 231) ← L 11
      fn(nodeArgs[i], i);
    }
  } while (multi && i !== -1);                                                                     // [R]  ◀ #9 DF: consome (R) ← L 11
}

// attempt to shutdown the wrapped node instance and remove
// the monitor file as nodemon exists
function cleanup() {
  node && node.kill();
  fs.unlink(flag);  
}

// control arguments test for "help" or "--help" or "-h", run the callback and exit
controlArg(nodeArgs, 'help', function () {
  usage();
  process.exit();
});

controlArg(nodeArgs, 'version', function () {
  sys.print('v' + meta.version + '\n');
  process.exit();
});

// look for delay flag
controlArg(nodeArgs, 'delay', function (arg, i) {
  var delay = nodeArgs[i+1];
  nodeArgs.splice(i, 2); // remove the delay from the arguments
  app = nodeArgs[0];
  if (delay) {
    sys.log('[nodemon] Adding delay of ' + delay + ' seconds');
    restartDelay = delay * 1000; // in seconds
  }
});

// look for watch flag                                                                             // [R]
controlArg(nodeArgs, { label: 'watch', multi: true }, function (arg, i) {                          // [R]  ◀ #10 DF: consome (R) ← L 11
  var dir = nodeArgs[i+1];                                                                         // [R]
  nodeArgs.splice(i, 2); // remove flag from the arguments                                         // [R]
  app = nodeArgs[0];                                                                               // [R]
  if (dir) {                                                                                       // [R]
    dirs.push(dir);                                                                                // [R]
  }                                                                                                // [R]
});                                                                                                // [R]
                                                                                                   // [R]
controlArg(nodeArgs, 'js', function (arg, i) {
  nodeArgs.splice(i, 1); // remove this flag from the arguments
  // sys.log('[nodemon] monitoring all filetype changes');
  addIgnoreRule('^((?!\.js$).)*$', true); // ignores everything except JS
  app = nodeArgs[0];
});

controlArg(nodeArgs, '--debug', function (arg, i) {
  nodeArgs.splice(i, 1);
  app = nodeArgs[0];
  nodeArgs.unshift('--debug'); // put it at the front
});

if (!nodeArgs.length || !path.existsSync(app)) {
  // try to get the app from the package.json
  // doing a try/catch because we can't use the path.exist callback pattern
  // or we could, but the code would get messy, so this will do exactly 
  // what we're after - if the file doesn't exist, it'll throw.
  try {
    app = JSON.parse(fs.readFileSync('./package.json').toString()).main;
    
    if (nodeArgs[0] == '--debug') {
      nodeArgs.splice(1, 0, app);
    } else {
      nodeArgs.unshift(app);
    }
  } catch (e) {
    // no app found to run - so give them a tip and get the feck out
    usage();
    process.exit();
  }
}

sys.log('[nodemon] v' + meta.version);

if (dirs.length === 0) {                                                                           // [R]
  dirs.unshift(process.cwd());                                                                     // [R]
}                                                                                                  // [R]
                                                                                                   // [R]
// this was causing problems for a lot of people, so now not moving to the subdirectory
// process.chdir(path.dirname(app));
app = path.basename(app);
dirs.forEach(function(dir) {                                                                       // [R]
  sys.log('\x1B[32m[nodemon] watching: ' + dir + '\x1B[0m');                                       // [R]  ◀ #1 DF: consome (R) ← L 3
});                                                                                                // [R]
sys.log('[nodemon] running ' + app);

startNode();

setTimeout(startMonitor, timeout);

path.exists(ignoreFilePath, function (exists) {
  if (!exists) {
    // try the old format
    path.exists(oldIgnoreFilePath, function (exists) {
      if (exists) {
        sys.log('[nodemon] detected old style .nodemonignore');
        ignoreFilePath = oldIgnoreFilePath;
      } else {
        // don't create the ignorefile, just ignore the flag & JS
        addIgnoreRule(flag);
        addIgnoreRule('^((?!\.js$).)*$', true);
      }
    });
  } else {
    readIgnoreFile();
  }
});

// this little bit of hoop jumping is because sometimes the file can't be
// touched properly, and it send nodemon in to a loop of restarting.
// this way, the .monitor file is removed entirely, and recreated with 
// permissions that anyone can remove it later (i.e. if you run as root
// by accident and then try again later).
if (path.existsSync(flag)) fs.unlinkSync(flag);
fs.writeFileSync(flag, '');
fs.chmodSync(flag, '666');

// remove the flag file on exit
process.on('exit', function (code) {
  cleanup();
  sys.log('[nodemon] exiting');
});

// usual suspect: ctrl+c exit
process.on('SIGINT', function () {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', function () {                                                                // [L]
  cleanup();                                                                                       // [L]
  process.exit(0);                                                                                 // [L]
});                                                                                                // [L]
                                                                                                   // [L]
// on exception *inside* nodemon, shutdown wrapped node app
process.on('uncaughtException', function (err) {
  sys.log('[nodemon] exception in nodemon killing node');
  sys.error(err.stack);
  cleanup();
});

// ─────────────────────────────────────────────────────────────────────────────
// Legenda (merge_anotado.js; a numeração das linhas é a mesma do merge.js e do README):
//   [L] / [R]   linha alterada por aquele lado        [L=R]  igual nos dois lados (o mapa conta como L)
//   ◀ #n        papel da linha no conflito n do README.md; "herdou" = a linha não foi alterada por aquele
//               lado e pegou a branch da chamada indicada (regra interprocedural da análise)
