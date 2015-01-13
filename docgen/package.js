'use strict';

// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
var path = require('canonical-path');

var Package = require('dgeni').Package;

// Create and export a new Dgeni package called appverse-dgeni. This package depends upon
// the jsdoc and nunjucks packages defined in the dgeni-packages npm module.
module.exports = new Package('appverse-dgeni', [
  require('dgeni-packages/ngdoc'),
  require('dgeni-packages/nunjucks')
])
// override ngdocs getLinkInfo
.factory(require('./services/getLinkInfo'))

.processor(require('./processors/index-generate'))
.processor(require('./processors/copy-assets'))

/*
.config(function(inlineTagProcessor, getInjectables) {
  inlineTagProcessor.inlineTagDefinitions = inlineTagProcessor.inlineTagDefinitions.concat(getInjectables([
    require('./inline-tags-defs/link')
  ]));
})
*/

.config(function(computeIdsProcessor, createDocMessage, getAliases) {
  computeIdsProcessor.idTemplates.push({
    docTypes: ['controller', 'provider', 'service', 'directive', 'input', 'object', 'function', 'filter', 'type' ],
    idTemplate: '${module}-${docType}-${name}',
    getAliases: getAliases
  });
})

.config(function(copyAssetsProcessor, createDocMessage) {
    copyAssetsProcessor.source = path.resolve(__dirname, 'templates/assets');
    // This is relative to the docs' outputPath
    copyAssetsProcessor.destination = 'assets';
})

.config(function(computePathsProcessor, createDocMessage) {
  computePathsProcessor.pathTemplates = [];
  computePathsProcessor.pathTemplates.push({
    docTypes: ['controller', 'provider', 'service', 'directive', 'input', 'object', 'function', 'filter', 'type' ],
    pathTemplate: '${area}/${module}/${docType}/${name}',
    outputPathTemplate: '${module}-${docType}-${name}.html'
  });
  computePathsProcessor.pathTemplates.push({
    docTypes: ['module' ],
    pathTemplate: '${area}/${name}',
    outputPathTemplate: '${module}-index.html'
  });
  computePathsProcessor.pathTemplates.push({
    docTypes: ['componentGroup' ],
    pathTemplate: '${area}/${moduleName}/${groupType}',
    outputPathTemplate: '${moduleName}-${groupType}-index.html'
  });
  // Sets the template paths for the main file index.html
  computePathsProcessor.pathTemplates.push({
    docTypes: ['index'],
    pathTemplate: 'index',
    outputPathTemplate: 'index.html'
  });
})


// Configure our appverse-dgeni package. We can ask the Dgeni dependency injector
// to provide us with access to services and processors that we wish to configure
.config(function(log, readFilesProcessor, templateFinder, writeFilesProcessor, computeIdsProcessor, getAliases) {

  // Set the template for the main index file
  computeIdsProcessor.idTemplates.push({
    docTypes: ['index'],
    idTemplate: 'index',
    getAliases: getAliases
  });

  // Set logging level
  log.level = 'silly';

  // Specify the base path used when resolving relative paths to source and output files
  readFilesProcessor.basePath = path.resolve(__dirname, '..');

  // Specify collections of source files that should contain the documentation to extract
  readFilesProcessor.sourceFiles = [
    {
      // Process all js files in `src` and its subfolders ...
      include: 'src/api-cache/*.js',
      // ... except for this one!
      exclude: 'src/angular-jqm.js',
      // When calculating the relative path to these files use this as the base path.
      // So `src/foo/bar.js` will have relative path of `foo/bar.js`
      basePath: 'src'
    }
  ];

  // Add a folder to search for our own templates to use when rendering docs
  templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));

  // Specify how to match docs to templates.
  // In this case we just use the same static template for all docs
  //templateFinder.templatePatterns.unshift('common.template.html');

  // Specify where the writeFilesProcessor will write our generated doc files
  writeFilesProcessor.outputFolder  = 'doc';
});