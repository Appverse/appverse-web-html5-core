(function() { 'use strict';

angular.module('AppDetection')
    .provider('MobileLibrariesLoader', MobileLibrariesLoaderProvider);

/**
 * @ngdoc provider
 * @name AppDetection.provider:MobileLibrariesLoader
 * @description
 * Loads libraries targeted at mobile devices
 */
function MobileLibrariesLoaderProvider() {

    this.load = function() {
        $.ajax({
            async: false,
            url: "bower_components/angular-touch/angular-touch.js",
            dataType: 'script'
        });
        $.ajax({
            async: false,
            url: "bower_components/angular-animate/angular-animate.js",
            dataType: 'script'
        });
        $.ajax({
            async: false,
            url: "bower_components/angular-route/angular-route.js",
            dataType: 'script'
        });
        $.ajax({
            async: false,
            url: "scripts/api/angular-jqm.js",
            dataType: 'script'
        });
    };

    this.$get = function() {
        return this;
    };

}

})();