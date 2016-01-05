(function () {
    'use strict';

    angular.module('appverse.rest').factory('RESTFactory', RESTFactory);

    /**
     * @ngdoc service
     * @name RESTFactory
     * @module appverse.rest
     * @description
     * Contains methods for data finding (demo).
     * This module provides basic quick standard access to a REST API.
     *
     * @requires https://docs.angularjs.org/api/ngMock/service/$log $log
     * @requires https://docs.angularjs.org/api/ngMock/service/$q $q
     * @requires https://docs.angularjs.org/api/ngMock/service/$http $http
     * @requires https://github.com/mgonto/restangular Restangular
     * @requires REST_CONFIG
     */
    function RESTFactory($log, $q, $http, Restangular, REST_CONFIG) {

        ////////////////////////////////////////////////////////////////////////////////////
        // ADVICES ABOUT PROMISES
        //
        // 1-PROMISES
        // All Restangular requests return a Promise. Angular's templates
        // are able to handle Promises and they're able to show the promise
        // result in the HTML. So, if the promise isn't yet solved, it shows
        // nothing and once we get the data from the server, it's shown in the template.
        // If what we want to do is to edit the object you get and then do a put, in
        // that case, we cannot work with the promise, as we need to change values.
        // If that's the case, we need to assign the result of the promise to a $scope variable.
        // 2-HANDLING ERRORS
        // While the first param is te callback the second parameter is the error handler function.
        //
        //  Restangular.all("accounts").getList().then(function() {
        //      console.log("All ok");
        //  }, function(response) {
        //      console.log("Error with status code", response.status);
        //  });
        // 2-HANDLING LISTS
        // The best option for doing CRUD operations with a list,
        // is to actually use the "real" list, and not the promise.
        // It makes it easy to interact with it.
        ////////////////////////////////////////////////////////////////////////////////////

        var factory = {};

        /**
         * @ngdoc method
         * @name RESTFactory#wrapRequestWith
         *
         * @param {object} The request wrapper
         * @description Wraps a request.
         * The wrapper should expose a 'wrapRequest(Restangular)' function
         * that wraps the requests and returns the processed Restangular service
         */
        factory.wrapRequestsWith = function (wrapper) {
            Restangular = wrapper.wrapRequest(Restangular);
        };

        /**
         * @ngdoc method
         * @name RESTFactory#wrapRequestWith
         *
         * @description Sets the default Content-Type as header.
         */
        factory.enableDefaultContentType = function () {
            Restangular.setDefaultHeaders({
                'Content-Type': REST_CONFIG.DefaultContentType
            });
        };

        /**
         * @ngdoc method
         * @name RESTFactory#setCache
         *
         * @description Sets the cache. Caching also depends on REST_CONFIG
         */
        factory.setCache = function (cache) {
            Restangular.setResponseInterceptor(
                function (data, operation) {
                    // Caches response data or not according to configuration.
                    if (cache) {
                        if (REST_CONFIG.NoCacheHttpMethods[operation] === true) {
                            cache.removeAll();
                        }
                    }
                    return data;
                }
            );
        };

        /**
         * @ngdoc method
         * @name RESTFactory#readBatch
         *
         * @param {String} path The item URL
         * @description Returns a complete list from a REST resource.
         * It is specially recommended when retrieving large amounts of data. Restangular adds 4 additional fields
         * per each record: route, reqParams, parentResource and restangular Collection.
         * These fields add a lot of weight to the retrieved JSON structure.
         * So, we need the lightest as possible data weight.
         * This method uses the $http AngularJS service. So, Restangular object settings are not applicable.
         * @returns {object} Promise with a large data structure
         */
        factory.readBatch = function (path) {
            var d = $q.defer();
            $http.get(Restangular.configuration.baseUrl + '/' + path + Restangular.configuration.suffix)
                .success(function (data) {
                    d.resolve(data);
                });
            return d.promise;
        };

        /**
         * @ngdoc method
         * @name RESTFactory#readParallelMultipleBatch
         *
         * @param {String} paths An array with URLs for each resource
         * @description Returns a combined result from several REST resources in chained promises.
         * It is specially recommended when retrieving large amounts of data. Restangular adds 4 additional fields
         * per each record: route, reqParams, parentResource and restangular Collection.
         * These fields add a lot of weight to the retrieved JSON structure.
         * So, we need the lightest as possible data weight.
         * This method uses the $http AngularJS service. So, Restangular object settings are not applicable.
         * @returns {object} Promise with a large data structure
         */
        factory.readParallelMultipleBatch = function (paths) {
            var promises = [];

            angular.forEach(paths, function (path) {

                var deferred = $q.defer();
                factory.readBatch(path).then(function (data) {
                        deferred.resolve(data);
                    },
                    function () {
                        deferred.reject();
                    });

                promises.push(deferred.promise);

            });

            return $q.all(promises);
        };

        return factory;

    }

})();