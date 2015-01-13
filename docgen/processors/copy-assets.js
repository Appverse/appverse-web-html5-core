"use strict";

var ncp = require('ncp').ncp;
var path = require('canonical-path');


/**
 * Copy statict assets to the destination directory
 */
module.exports = function copyAssetsProcessor(log, readFilesProcessor, writeFilesProcessor) {
  return {
    source: null,
    destination: null,
    $validate: {
      source: { presence: true },
      destination: { presence: true },
    },
    $runAfter:['writing-files'],
    $runBefore: ['files-written'],
    $process: function() {
      var source = path.resolve(readFilesProcessor.basePath, this.source);
      var destination = path.resolve(writeFilesProcessor.outputFolder, this.destination);
      ncp.limit = 16;
      log.debug(source);
      log.debug(destination);
      return ncp(source, destination, function (err) {
        if (err) {
          return log.error(err);
        }
        log.debug('assets copied');
      });
    }
  };
};