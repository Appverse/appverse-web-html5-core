(function (angular) { 'use strict';

    // AngularJS injector service
    var injector;

    // -- Integration functions for providers (config stage) --
    // Define integration functions to be run in the main config block here.
    // These functions can deal with providers and constants only.
    var providerIntegrators = [

        function integrateDetectionAndConfig() {
            if (moduleExists('AppDetection')) {
                var detectionProvider = injector.get('DetectionProvider');
                var configLoaderProvider = injector.get('ConfigLoaderProvider');
                configLoaderProvider.setDetection(detectionProvider);
            }
        },

        function integrateLoggingAndDetection() {
            if (moduleExists('AppLogging') && moduleExists('AppDetection')) {
                var detectionProvider = injector.get('DetectionProvider');
                var formattedLoggerProvider = injector.get('formattedLoggerProvider');
                formattedLoggerProvider.setDetection(detectionProvider);
            }
        }

        // ...more integrations HERE...
    ];

    // -- Integration functions for service instances (run stage) --
    // Define integration functions to be run in the run block here.
    // These functions can deal with services and constants only.
    var serviceIntegrators = [

        function integrateRestAndSecurity() {
            var restService  = injector.get('RESTFactory'),
            $log             = injector.get('$log'),
            SECURITY_GENERAL = injector.get('SECURITY_GENERAL');

            if (moduleExists('AppSecurity')) {
                var oauthRequestWrapperService = injector.get('Oauth_RequestWrapper');
                if (SECURITY_GENERAL.securityEnabled){
                    restService.wrapRequestsWith(oauthRequestWrapperService);
                    $log.debug( "REST communication is secure. Security is enabled." +
                        " REST requests will be wrapped with authorization headers.");
                    return;
                }
            }

            restService.enableDefaultContentType();
            $log.debug("REST communication is not secure. Security is not enabled.");
        },

        function integrateRestAndCache() {
            if (moduleExists('AppCache')) {
                var restService = injector.get('RESTFactory'),
                CacheFactory    = injector.get('CacheFactory'),
                cache           = CacheFactory.getHttpCache();
                restService.setCache(cache);
            }
        }

        // ...more integrations HERE...
    ];



    /**
     * Runs the integrations between modules.
     * It only runs integrations if modules are present.
     * Integrations can happen in two stages: config and run.
     * Integratior functions for config stage should use providers
     * Integratior functions for run stage should use service instances
     *
     * @param {[type]} $injector [description]
     */
    function ModuleIntegrator($injector) {
        injector = $injector;
        this.providerIntegrators = providerIntegrators;
        this.serviceIntegrators = serviceIntegrators;
    }

    ModuleIntegrator.withInjector = function($injector) {
        return new ModuleIntegrator($injector);
    };

    /**
     * Only pushes required and loaded optional modules
     * to the dependencies list
     * @param {array} requires Compulsory module dependencies
     * @param {array} optional Optional module dependencies
     *
     * @return {array} List of module dependencies
     */
    ModuleIntegrator.generateDependencies = function(requires, optional) {
        var dependencies = requires;
        angular.forEach(optional, function (module) {
            if (moduleExists(module)) {
                dependencies.push(module);
            }
        });
        return dependencies;
    };


    ModuleIntegrator.prototype.integrateProviders = function() {
        this.runIntegrationFunctions(this.providerIntegrators);
    };

    ModuleIntegrator.prototype.integrateServices = function() {
        this.runIntegrationFunctions(this.serviceIntegrators);
    };

    ModuleIntegrator.prototype.runIntegrationFunctions = function(functionsArray) {
        var integratorsCount = functionsArray.length;
        for (var i = 0; i < integratorsCount; i++) {
            functionsArray[i]();
        }
    };

    function moduleExists(name) {
        try {
            angular.module(name);
            return true;
        } catch (e) {
            return false;
        }
    }

    window.ModuleIntegrator = ModuleIntegrator;
    window.moduleExists = moduleExists;

})(angular);



