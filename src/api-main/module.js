(function() {'use strict';

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

var required = [
    'AppRouter',
    'AppCache',
    'AppConfiguration',
    'jqm',
    'AppPerformance'
];

var optional = [
    'xeditable',
    'ja.qr',
    'vr.directives.slider',
    'ui.bootstrap',
    'AppDetection',
    'AppREST',
    'AppTranslate',
    'AppModal',
    'AppLogging',
    'AppServerPush',
    'AppSecurity',
    'ngGrid',
    'ui.router'
];

/* Main module */
angular.module('COMMONAPI', generateDependencies())
    .config(config)
    .run(run);

function config($compileProvider, $injector) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|itms-services):/);

    if (moduleExists('AppLogging') && moduleExists('AppDetection')) {
        var detectionProvider = $injector.get('DetectionProvider');
        var formattedLoggerProvider = $injector.get('formattedLoggerProvider');
        formattedLoggerProvider.setDetection(detectionProvider);
    }

}

function run() {
     console.log('commonapi run');
}

function generateDependencies() {
    var dependencies = required;
    angular.forEach(optional, function (module) {
        if (moduleExists(module)) {
            dependencies.push(module);
        }
    });
    return dependencies;
}

function moduleExists(name) {
    try {
        angular.module(name);
        return true;
    } catch (e) {
        return false;
    }
}


})();
