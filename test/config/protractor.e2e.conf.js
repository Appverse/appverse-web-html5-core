exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '../e2e/*.js'
  ],

  capabilities: {
    browserName: 'phantomjs',
    'phantomjs.binary.path': 'node_modules/.bin/phantomjs' + (process.platform === 'win32' ? '.cmd' : ''),
    'phantomjs.cli.args': ['--ignore-ssl-errors=true', '--web-security=false']
  },

  seleniumAddress: 'http://localhost:4444/wd/hub',

  baseUrl: 'http://localhost:9090/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
