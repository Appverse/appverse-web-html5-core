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

    var mainModuleName;

    function setConfig(settingsObject) {
        settings = settingsObject;
        angular.module('AppConfigLoader').config(loadConfig);
        return AppInit;
    }

    function bootstrap(appMainModule) {
        var moduleName = appMainModule || mainModuleName;
        angular.element(document).ready(function() {
            angular.bootstrap(document, [moduleName]);
        });
    }

    function setMainModuleName(name) {
        mainModuleName = name;
    }

    function getMainModule() {
        return angular.module(mainModuleName);
    }

    function loadConfig(ConfigLoaderProvider) {
        ConfigLoaderProvider.load(settings);
    }

    return {
        setMainModuleName : setMainModuleName,
        setConfig : setConfig,
        bootstrap : bootstrap,
        getMainModule : getMainModule
    };

})(angular);