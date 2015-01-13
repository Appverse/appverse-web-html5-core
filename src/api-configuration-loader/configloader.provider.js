(function() { 'use strict';

angular.module('AppConfigLoader').provider('ConfigLoader', ConfigLoaderProvider);

/**
 * @ngdoc provider
 * @name ConfigLoader
 * @module AppConfigLoader
 *
 * @description
 * Loads configuration parameters int the AppConfiguration module.
 */
function ConfigLoaderProvider() {

    var appConfigTemp = {},
    //by default, no detection is present
    detection         = new NoDetection();

    /**
     * @ngdoc method
     * @name  ConfigLoader#setDetection
     * @param {object} detectionProvider Detection provider from app detection
     */
    this.setDetection = function(detectionProvider) {
        detection = detectionProvider;
    };

    /**
     * @ngdoc method
     * @name  ConfigLoader#loadDefaultConfig
     *
     * @description Loads the default config from AppConfigDefault
     * @return {object} the service instance
     */
    this.loadDefaultConfig = function() {
        angular.forEach(angular.module('AppConfigDefault')._invokeQueue, function (element) {
            appConfigTemp[element[2][0]] = element[2][1];
        });
        return this;
    };

    /**
     * @ngdoc method
     * @name  ConfigLoader#loadCustomConfig
     *
     * @description Loads custom config specified by the developer, for desktop and mobile environments
     * @return {object} the service instance
     */
    this.loadCustomConfig = function(settings) {
        if (settings) {
            this.settings =  settings;
        }
        this.loadMobileConfigIfRequired();
        this.loadEnvironmentConfig();
        return this;
    };

    /**
     * @ngdoc method
     * @name  ConfigLoader#overrideDefaultConfig
     *
     * @description Overrides the default config with the loaded custom config
     */
    this.overrideDefaultConfig = function() {
        angular.forEach(appConfigTemp, function (propertyValue, propertyName) {
            angular.module('AppConfiguration').constant(propertyName, propertyValue);
        });
    };


    this.loadMobileConfigIfRequired = function() {
        if (detection.hasAppverseMobile()) {
            this.loadAppverseMobileConfig();
        } else if (detection.isMobileBrowser()) {
            this.loadMobileBrowserConfig();
        }
    };

    this.loadEnvironmentConfig = function() {
        if (this.settings && this.settings.environment) {
            this.addConfig(this.settings.environment);
        } else {
            this.addConfigFromJSON('resources/configuration/environment-conf.json');
        }
        return this;
    };

    this.loadAppverseMobileConfig = function() {
        if (this.settings && this.settings.appverseMobile) {
            this.addConfig(this.settings.appverseMobile);
        } else {
            this.addConfigFromJSON('resources/configuration/appversemobile-conf.json');
        }
        return this;
    };

    this.loadMobileBrowserConfig = function() {
        if (this.settings && this.settings.mobileBrowser) {
            this.addConfig(this.settings.mobileBrowser);
        } else {
            this.addConfigFromJSON('resources/configuration/mobilebrowser-conf.json');
        }

        return this;
    };

    this.addConfig = function(settings) {
        angular.forEach(settings, function (constantObject, constantName) {
            var appConfigObject = appConfigTemp[constantName];

            if (appConfigObject) {
                angular.forEach(constantObject, function (propertyValue, propertyName) {
                    appConfigObject[propertyName] = propertyValue;
                });
                appConfigTemp[constantName] = appConfigObject;
            } else {
                appConfigTemp[constantName] = constantObject;
            }
        });

    };

    this.addConfigFromJSON = function(jsonUrl) {

        // Make syncrhonous request.
        // TODO: make asyncrhonous. Synchronous requests block the browser.
        // Making requests asyncronous will require to manually bootstrap angular
        // when the response is received.
        // Another option is to let the developer inject the configuration in the config phase
        var request = new XMLHttpRequest();
        // `false` makes the request synchronous
        request.open('GET', jsonUrl, false);
        request.send(null);
        var jsonData = JSON.parse(request.responseText);

        this.addConfig(jsonData);
    };



    this.$get = function() {
        return this;
    };
}


/**
 * Used when no detection is provided
 */
function NoDetection() {

    this.hasAppverseMobile = function() {
        return false;
    };

    this.isMobileBrowser = function() {
        return false;
    };

}


})();
