module.exports = {

    // The timeout for each script run on the browser. This should be longer
    // than the maximum time your application needs to stabilize between tasks.
    allScriptsTimeout: 11000,

    // Test scripts. Populate in specific test config
    specs: [],

    capabilities: {
        browserName: 'phantomjs',
        'phantomjs.binary.path': 'node_modules/.bin/phantomjs' + (process.platform === 'win32' ? '.cmd' : ''),
        'phantomjs.cli.args': ['--ignore-ssl-errors=true', '--web-security=false']
    },

    seleniumAddress: 'http://localhost:4444/wd/hub',

    //Populate in specific test config
    baseUrl: '',

    framework: 'jasmine',

    // ----- Options to be passed to minijasminenode -----
    jasmineNodeOpts: {
        /**
         * onComplete will be called just before the driver quits.
         */
        onComplete: function () {},
        // If true, display spec names.
        isVerbose: false,
        // If true, print colors to the terminal.
        showColors: true,
        // If true, include stack traces in failures.
        includeStackTrace: true,
        // Default time to wait in ms before a test fails.
        defaultTimeoutInterval: 30000
    }

};
