'use strict';

var commonSettings = require('./common.conf');


/**
 * Builds a test configuration array for Karma
 */






function Configurator () {

    return {

        basePath : commonSettings.basePath,
        frameworks: comm
    }


}


Configurator.prototype.getSettings = function() {
    if (coverageReportEnabled) {
        addSettings(coverageSettings);
    }
    return settings;
};

Configurator.prototype.addSettings = function(settingsObject) {
    for(var key in settingsObject) {
        if (settingsObject.hasOwnProperty(key)) {
            settings[key] = settingsObject[key];
        }
    }
};

module.exports = new Configurator();