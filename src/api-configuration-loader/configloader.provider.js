(function() { 'use strict';

angular.module('AppConfigLoader').provider('ConfigLoader', ConfigLoaderProvider);

/**
 * @ngdoc module
 * @name AppConfiguration.provider:ConfigLoader
 * @requires AppDetection
 * @description
 * It includes constants for all the common API components.
 */
function ConfigLoaderProvider(DetectionProvider) {

    var appConfigTemp = {},
    detection         = DetectionProvider;

    this.loadDefaultConfig = function() {
        angular.forEach(angular.module('AppConfigDefault')._invokeQueue, function (element) {
            appConfigTemp[element[2][0]] = element[2][1];
        });
        return this;
    };

    this.loadCustomConfig = function() {
        this.loadMobileConfigIfRequired();
        this.loadEnvironmentConfig();
        return this;
    };

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
        this.addConfigFromJSON('resources/configuration/environment-conf.json');
        return this;
    };

    this.loadAppverseMobileConfig = function() {
        this.addConfigFromJSON('resources/configuration/appversemobile-conf.json');
        return this;
    };

    this.loadMobileBrowserConfig = function() {
        this.addConfigFromJSON('resources/configuration/mobilebrowser-conf.json');
        return this;
    };

    this.addConfigFromJSON = function(jsonUrl) {
        var ajaxResponse = $.ajax({
            async: false,
            url: jsonUrl,
            dataType: "json"
        });

        var jsonData = JSON.parse(ajaxResponse.responseText);

        angular.forEach(jsonData, function (constantObject, constantName) {
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

    this.$get = function() {
        return this;
    };
}


})();
