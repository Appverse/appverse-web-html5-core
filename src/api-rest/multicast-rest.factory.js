(function() {
    'use strict';

    angular.module('AppREST')

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