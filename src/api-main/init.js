/**
 * This file includes functionality to initialize settings in an appverse-web-html5 app
 * Just call the initalization code after having loaded angular and the configuration module:
 *
 * AppInit.setConfig(settings).bootstrap()
 *
 * @return {object} AppInit
 */
var AppInit = AppInit || (function(angular) { 'use strict';

    var settings;

    function setConfig(settingsObject) {
        settings = settingsObject;
        angular.module('AppConfigLoader').config(loadConfig);
        return AppInit;
    }

    function bootstrap(appMainModule) {
        angular.element(document).ready(function() {
            angular.bootstrap(document, [appMainModule]);
        });
    }

    function loadConfig(ConfigLoaderProvider) {
        ConfigLoaderProvider
            .loadDefaultConfig()
            .loadCustomConfig(settings)
            .overrideDefaultConfig();
    }

    return {
        setConfig: setConfig,
        bootstrap: bootstrap
    };

})(angular);