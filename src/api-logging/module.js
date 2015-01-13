(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name AppLogging
     *
     * @description
     * The Logging module handles several tasks with logging:
     *
     * 1. It applies a decorator on native $log service in module ng.
     *
     * 2. It includes sending of log events to server-side REST service.
     *
     * ## Warning
     *
     * IT IS STRONGLY RECOMMENDED TO USE THIS LOG IMPLEMENTATION AND NEVER directly
     * to use console.log() to log debugger messages.
     * If you do not use this one, use $log instead at least...
     *
     * ## Server side log
     *
     * To handle JavaScript errors, we needed to intercept the core AngularJS
     * error handling and add a server-side communication aspect to it.
     *
     * ## Decorator way
     *
     * The $provide service (which provides all angular services) needs 2 parameters to “decorate” something:
     *
     * 1) the target service;
     *
     * 2) the callback to be executed every time someone asks for the target.
     *
     * This way, we are telling in config time to Angular that every time
     * a service/controller/directive asks for $log instance,
     * Angular will provide the result of the callback.
     * As you can see, we are passing the original $log
     * and formattedLogger (the API implementation) to the callback,
     * and then, he returns a formattedLogger factory instance.
     */
    angular.module('AppLogging', ['AppConfiguration'])
        .config(["$provide",  function ($provide) {
            $provide.decorator("$log", ['$delegate', 'formattedLogger',
                function ($delegate, formattedLogger) {
                    return formattedLogger($delegate);
                }]);
        }]);

})();