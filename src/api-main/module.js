(function() {
    'use strict';

    /*global ModuleIntegrator */

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
        'AppConfiguration',
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
     * Main module.
     * Bootstraps the application by integrating services that have any relation.
     */
    angular.module('COMMONAPI', ModuleIntegrator.generateDependencies(requires, optional))
        .config(config)
        .run(run);


    /**
     * Preliminary configuration.
     *
     * Configures the integration between modules that need to be integrated
     * at the config phase.
     */
    function config($compileProvider, $injector) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|itms-services):/);
        ModuleIntegrator.withInjector($injector).integrateProviders();
    }

    /**
     * Main
     *
     * Runs integration tasks between modules that can be integrated
     * at run phase
     */
    function run($injector) {
        ModuleIntegrator.withInjector($injector).integrateServices();
    }


})();
