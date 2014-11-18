(function() { 'use strict';

angular.module('AppConfigLoader').config(config);

config.$inject = ['ConfigLoaderProvider'];
function config(ConfigLoaderProvider) {
    // Trigger the configuration loading process
    ConfigLoaderProvider
        .loadDefaultConfig()
        .loadCustomConfig()
        .overrideDefaultConfig();
}

})();
