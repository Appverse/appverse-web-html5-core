'use strict';
var
Dgeni                = require('dgeni'),
path                 = require('canonical-path'),
appverseDgeniPackage = require('./package');

function generateDocsTask () {
    var done = this.async();

    // Configure our appverse-dgeni package. We can ask the Dgeni dependency injector
    // to provide us with access to services and processors that we wish to configure
    appverseDgeniPackage.config(setSettings);

    // Create dgeni instance and generate docs
    var dgeni = new Dgeni( [appverseDgeniPackage] );
    dgeni.generate().then(finishTask);

    function finishTask(docs) {
        console.info(docs.length, 'docs generated');
        done();
    }
}

/**
 * Configures the package
 * All params are autoinjected by Dgeni
 */
function setSettings(log, readFilesProcessor, templateFinder, writeFilesProcessor) {

    // Set logging level [errors, info, debug, silly]
    log.level = 'info';

    // Specify the base path used when resolving relative paths to source and output files
    readFilesProcessor.basePath = path.resolve(__dirname, '../../..');

    // Specify collections of source files that should contain the documentation to extract
    readFilesProcessor.sourceFiles = [{
        // Process all js files in `src` and its subfolders ...
        include: ['src/appverse/**/*.js', 'src/appverse-*/**/*.js'],
        // Do not include these files
        exclude: [],
        // When calculating the relative path to these files use this as the base path.
        // So `src/foo/bar.js` will have relative path of `foo/bar.js`
        basePath: 'src'
    }];

    // Specify where the writeFilesProcessor will write our generated doc files
    writeFilesProcessor.outputFolder  = 'doc';
}


module.exports = generateDocsTask;