(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name  MulticastRESTFactory
     * @module appverse.rest
     *
     * @requires https://docs.angularjs.org/api/ngMock/service/$log $log
     * @requires https://github.com/mgonto/restangular Restangular
     * @requires REST_CONFIG
     */
    angular.module('appverse.rest')
    .factory('MulticastRESTFactory', ['$log', 'Restangular', 'REST_CONFIG',

        function ($log, Restangular, REST_CONFIG) {
            var factory = {};
            var multicastSpawn = REST_CONFIG.Multicast_enabled;
            $log.debug('Multicast Enabled : ' + multicastSpawn);

            factory.readObject = function (path, params) {
                if(params && params.length >0){

                }else{
                    //No params. It is a normal call
                    return Restangular.one(path).get().$object;
                }

            };

            return factory;
        }]);


})();