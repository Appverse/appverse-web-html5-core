exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '../e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  // Enables Protractor to test directly against Chrome and Firefox without using a Selenium Server.
  directConnect: true,

  baseUrl: 'http://localhost:9191/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
