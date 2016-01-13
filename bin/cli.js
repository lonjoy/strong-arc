#!/usr/bin/env node
var path = require('path');
var util = require('util');
var opener = require('opener');
var minimist = require('minimist');
var os = require('os');
var g = require('strong-globalize');
var DEFAULT_ARC_HOST = 'localhost';
var ALL_INTF_HOST = '0.0.0.0';

g.setRootDir(path.resolve(__dirname, '..'));
g.setDefaultLanguage();

var STRONG_ARC_RUNNING_MSG =
exports.STRONG_ARC_RUNNING_MSG = g.t('StrongLoop Arc is running here:');
var STRONG_ARC_REMOTE_WARN = g.t('NOTICE: Arc seems to have been launched from' +
' a remote connection. Depending on your network setup, Arc may not be' +
' accessible using the address above.');
var opts = minimist(process.argv.slice(2), {
  alias: {
    v: 'version',
    h: 'help',
  },
  boolean: [
    'licenses',
    'version',
    'help',
    'cli',
  ],
  string: [
    'feature',
    'features',
  ],
});

var argv = getArgv();
var pathArg = opts._[0];
var WORKSPACE_DIR = process.cwd();

if (opts.help) {
  printHelp();
} else if (opts.version) {
  printVersion();
}
process.exit(0);

// --features foo,bar --feature baz --feature quux
//  => {feaures: 'foo,bar', feature: ['baz', 'quux']}
//  => ['foo', 'bar', 'baz', 'quux']
var features = [].concat(opts.feature, opts.features).map(function(f) {
  return f && f.split(',');
}).reduce(function(acc, f) {
  return f ? acc.concat(f) : acc;
}, []);
process.env.SL_ARC_FEATURE_FLAGS = features.join(path.delimiter);

var arc = require('../server/server');

if (pathArg) {
  WORKSPACE_DIR = path.join(WORKSPACE_DIR, pathArg);
}

process.env.WORKSPACE_DIR = process.env.WORKSPACE_DIR || WORKSPACE_DIR;

g.log('Loading workspace %s', process.env.WORKSPACE_DIR);

var port = process.env.PORT || 0;
var host = process.env.HOST || DEFAULT_ARC_HOST;

delete process.env.PORT;

var server = arc.listen(port, host, function(err) {
  if(err) {
    g.error('could not start Arc!');
    console.error(err);
    process.exit(1);
  }

  //add optional path if flag is passed
  var path = '#/' + ( opts.licenses ? 'licenses' : '' );
  var url = util.format('http://%s:%s/%s', resolveHost(host),
    server.address().port, path);

  console.log('%s %s', STRONG_ARC_RUNNING_MSG, url);

  if (isRemoteConnection()) {
    console.log(STRONG_ARC_REMOTE_WARN);
  }

  if (argv.indexOf('--cli') === -1) {
    opener(url);
  }
});

function isRemoteConnection() {
  return !!process.env.SSH_CONNECTION;
}

function getLocalIntfAddr(defaultAddr) {
  var intfs = os.networkInterfaces();
  var localIntfAddr = null;

  // find an actual address assigned to an interface on the current host
  Object.keys(intfs).forEach(function(name) {
    var intf = intfs[name];

    intf.forEach(function(addr) {
      if (addr.family === 'IPv4' && addr.internal === false) {
        localIntfAddr = addr.address;
        return false;
      }
    });

    if (localIntfAddr) {
      return false;
    }
  });

  return localIntfAddr || defaultAddr;
}

function resolveHost(host) {
  if (host === ALL_INTF_HOST) {
    return getLocalIntfAddr(ALL_INTF_HOST);
  }

  return host;
}

function getArgv() {
  return process.argv.slice(2);
}

function printHelp() {
  var cmd = process.env.CMD || 'strong-arc';
  g.log('arc-help.txt', cmd, cmd);
}

function printVersion() {
  console.log(require('../package.json').version);
}
