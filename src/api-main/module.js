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


/* Optional modules initialization */
var optionalModules = ['xeditable', 'ja.qr', 'vr.directives.slider', 'ui.bootstrap', 'AppDetection', 'AppREST', 'AppTranslate', 'AppModal', 'AppLogging', 'AppServerPush', 'AppSecurity', 'ngGrid', 'ui.router'];

angular.forEach(optionalModules, function (element) {
    try {
        angular.module(element);
    } catch (e) {
        angular.module(element, []);
    }
});

var dependencies = optionalModules.concat(['AppRouter', 'AppCache', 'AppConfiguration', 'jqm', 'AppPerformance']);

/* Main module */
angular.module('COMMONAPI', dependencies)
    .config(config);

function config($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|itms-services):/);
}

})();
