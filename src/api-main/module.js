(function() {
    'use strict';

    //////////////////////// COMMON API - MAIN //////////////////////////
    // The Main module includes other API modules:
    // - Bootstrap-based styling and gadgets
    // - Routing
    // - External Configuration
    // - REST Integration
    // - Cache Service
    // - ServerPush
    // - Security
    // - Internationalization
    // - Logging
    /////////////////////////////////////////////////////////////////////

    /**
     * Required modules (compulsory)
     */
    var requires = [
        'AppUtils',
        'AppConfiguration'
    ];

    /**
     * Optional modules
     */
    var optional = [
        'AppDetection',
        'AppREST',
        'AppTranslate',
        'AppModal',
        'AppLogging',
        'AppServerPush',
        'AppSecurity',
        'AppCache',
        'AppPerformance',
        'AppRouter'
    ];


    /**
     * @ngdoc module
     * @name  COMMONAPI
     * @description Main module. Bootstraps the application by integrating services that have any relation.
     * It will automatically intialize any of these modules, whose scripts have been loaded:
     * * Bootstrap-based styling and gadgets
     * * Routing
     * * External Configuration
     * * REST Integration
     * * Cache Service
     * * ServerPush
     * * Security
     * * Internationalization
     * * Logging
     */
    angular.module('COMMONAPI', generateDependencies(requires, optional))
        .config(config);


    /**
     * Preliminary configuration.
     *
     * Configures the integration between modules that need to be integrated
     * at the config phase.
     */
    function config($compileProvider, $injector, ModuleSeekerProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|itms-services):/);

        // Integrate modules that have a dependency
        if (ModuleSeekerProvider.exists('AppDetection')) {
            var detectionProvider = $injector.get('DetectionProvider');
            var configLoaderProvider = $injector.get('ConfigLoaderProvider');
            configLoaderProvider.setDetection(detectionProvider);

            if (ModuleSeekerProvider.exists('AppLogging')) {
                var formattedLoggerProvider = $injector.get('formattedLoggerProvider');
                formattedLoggerProvider.setDetection(detectionProvider);
            }

        }
    }

    function generateDependencies(requires, optional) {
        var dependencies = requires;
        angular.forEach(optional, function (module) {
            if (moduleExists(module)) {
                dependencies.push(module);
            }
        });
        return dependencies;
    }

    // TODO: this function is already defined in AppUtils but cannot be used
    // when declaring a module as we can't inject anything yet. We must have a way
    // to call this function before being inside the angular environment. Global maybe?
    function moduleExists(name) {
        try {
            angular.module(name);
            return true;
        } catch (e) {
            return false;
        }
    }


})();
