"use strict";

/**
 * Generates an index file for the docs
 */
module.exports = function indexGenerateProcessor() {
  return {
    deployments: [],
    $validate: {},
    $runAfter: ['adding-extra-docs'],
    $runBefore: ['extra-docs-added'],
    $process: function(docs) {

      var modules = [];
      docs.forEach(function(doc) {
        if (doc.docType === 'module') {
          modules.push(doc);
        }
      });

      docs.push(createIndex(modules));
    }
  };
};

function createIndex(modules) {
  return {
    docType: 'index',
    id: 'index',
    template: 'index.template.js',
    modules: modules
  };
}