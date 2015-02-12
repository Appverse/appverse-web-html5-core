/**
 * @ngdoc object
 * @name  AppInit
 * @module  appverse
 * @description
 * This file includes functionality to initialize settings in an appverse-web-html5 app
 * Just call the initalization code after having loaded angular and the configuration module:
 * <pre><code>AppInit.setConfig(settings).bootstrap();</code></pre>
 */
var AppInit = AppInit || (function(angular) { 'use strict';

    var
    settings,
    mainModuleName;

    /**
     * @ngdoc method
     * @name AppInit#setConfig
     * @param {object} settingsObject An object containing custom settings
     * @description Sets custom settings
     */
    function setConfig(settingsObject) {
        settings = settingsObject;
        angular.module('appverse.configuration.loader').config(loadConfig);
        return AppInit;
    }

    /**
     * @ngdoc method
     * @name AppInit#bootstrap
     * @description Manually Bootstraps the application. For automatic bootstrap,
     * use the standard Angular way using the ng-app directive.
     *
     * @param {string} appMainModule The name of the main application module.
     * You can also use setMainModuleName and use this function without any parameters
     */
    function bootstrap(appMainModule) {
        var moduleName = appMainModule || mainModuleName;
        angular.element(document).ready(function() {
            angular.bootstrap(document, [moduleName]);
        });
    }

    /**
     * @ngdoc method
     * @name AppInit#setMainModuleName
     * @param {string} name The name of the main application module.
     */
    function setMainModuleName(name) {
        mainModuleName = name;
    }

    /**
     * @ngdoc method
     * @name AppInit#setMainModuleName
     * @return {string} The name of the main application module.
     */
    function getMainModule() {
        return angular.module(mainModuleName);
    }

    // ---- Privates -----

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