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
        'appverse.utils',
        'AppConfiguration'
    ];

    /**
     * Optional modules
     */
    var optional = [
        'AppDetection',
        'appverse.rest',
        'appverse.translate',
        'AppModal',
        'AppLogging',
        'appverse.serverPush',
        'AppSecurity',
        'appverse.cache',
        'appverse.performance',
        'appverse.router'
    ];


    /**
     * Main module.
     * Bootstraps the application by integrating services that have any relation.
     */
    angular.module('COMMONAPI', generateDependencies(requires, optional))
        .config(config)
        .run(run);


    /**
     * Preliminary configuration.
     *
     * Configures the integration between modules that need to be integrated
     * at the config phase.
     */
    function config($compileProvider, $injector, $provide, ModuleSeekerProvider, REST_CONFIG) {

        //Mock backend if necessary
        if (REST_CONFIG.MockBackend) {

            $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
        }

        // sanitize hrefs
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

    function run($log, REST_CONFIG) {
        if (REST_CONFIG.MockBackend) {
            $log.debug('REST: You are using a MOCKED backend!');
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

    // TODO: this function is already defined in appverse.utils but cannot be used
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
