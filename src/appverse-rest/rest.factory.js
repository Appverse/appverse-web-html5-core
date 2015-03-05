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
                function (data, operation, what, url, response) {
                    // Caches response data or not according to configuration.
                    if (cache) {
                        if (REST_CONFIG.NoCacheHttpMethods[operation] === true) {
                            cache.removeAll();
                        } else if (operation === 'put') {
                            cache.put(response.config.url, response.config.data);
                        }
                    }
                    return data;
                }
            );
        };

        /**
         * @ngdoc method
         * @name RESTFactory#readObject
         *
         * @param {String} path The item URL
         * @param {String} successFn Optional function to be called when request is successful
         * @param {String} errorFn Optional function to be called when request has errors
         * @description Returns a complete list from a REST resource.
         * @returns {object} List of values
         */
        factory.readObject = function (path, successFn, errorFn) {
            successFn = successFn || function () {};
            errorFn = errorFn || function () {};
            var promise = Restangular.one(path).get();
            promise.then(successFn, errorFn);
            return promise.$object;
        };

        /*
         * Returns a complete list from a REST resource.
            Use to get data to a scope var. For example:
            $scope.people = readList('people');
            Then, use the var in templates:
            <li ng-repeat="person in people">{{person.Name}}</li>
         */
        /**
         * @ngdoc method
         * @name RESTFactory#readList
         *
         * @param {String} path The item URL
         * @description Returns a complete list from a REST resource.
         * @returns {object} Does a GET to path
         * Returns an empty array by default. Once a value is returned from the server
         * that array is filled with those values.
         */
        factory.readList = function (path) {
            return Restangular.all(path).getList().$object;
        };

        /**
         * @ngdoc method
         * @name RESTFactory#readList
         *
         * @param {String} path The item URL
         * @description Returns a complete list from a REST resource.
         * @returns {object} Does a GET to path
         * It does not return an empty array by default.
         * Once a value is returned from the server that array is filled with those values.
         */
        factory.readListNoEmpty = function (path) {
            return Restangular.all(path).getList();
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
            $http.get(Restangular.configuration.baseUrl + '/' + path + REST_CONFIG.RequestSuffix)
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



        /**
         * @ngdoc method
         * @name RESTFactory#readListItem
         *
         * @param {String} path The item URL
         * @param {String} key The item key
         * @param {String} successFn Optional function to be called when request is successful
         * @param {String} errorFn Optional function to be called when request has errors
         * @description Returns a unique value.
         * @returns {object} An item value
         */
        factory.readListItem = function (path, key, successFn, errorFn) {
            successFn = successFn || function () {};
            errorFn = errorFn || function () {};
            var promise = Restangular.one(path, key).get();
            promise.then(successFn, errorFn);
            return promise.$object;
        };


        /**
         * @ngdoc method
         * @name RESTFactory#readListItems
         *
         * @param {String} path The item URL
         * @param {String} keys The item keys array
         * @description Returns a unique value.
         * @returns {object} List of values
         */
        factory.readListItems = function (path, keys) {
            return Restangular.several(path, keys).getList().$object;
        };


        /**
         * @ngdoc method
         * @name RESTFactory#createListItem
         *
         * @param {String} path The item URL
         * @param {object} newData The item to be created
         * @param {object} callback The function for callbacking
         * @description Returns result code.
         * @returns {object} The created item
         */
        factory.createListItem = function (path, newData, callback) {
            Restangular.all(path).post(newData).then(callback, restErrorHandler);
        };


        /**
         * @ngdoc method
         * @name RESTFactory#updateObject
         *
         * @param {String} path The item URL
         * @param {object} newData The item to be updated
         * @param {object} callback The function for callbacking
         * @description Returns result code.
         * @returns {object} The updated item
         */
        factory.updateObject = function (path, newData, callback) {
            Restangular.one(path).put(newData).then(callback, restErrorHandler);
        };


        /**
         * @ngdoc method
         * @name RESTFactory#deleteListItem
         *
         * @param {String} path The item URL
         * @param {object} key The item key to be deleted
         * @param {object} callback The function for callbacking
         * @description Deletes an item from a list.
         * @returns {object} The deleted item
         */
        factory.deleteListItem = function (path, key, callback) {
            // Use 'then' to resolve the promise.
            Restangular.one(path, key).get().then(function (item) {
                item.remove().then(callback, restErrorHandler);
            });
        };

        /**
         * @ngdoc method
         * @name RESTFactory#deleteObject
         *
         * @param {String} path The item URL
         * @param {object} callback The function for callbacking
         * @description Deletes an item from a list.
         * @returns {object} The deleted item
         */

        factory.deleteObject = function (path, callback) {
            // Use 'then' to resolve the promise.
            Restangular.one(path).delete().then(callback, restErrorHandler);
        };

        /**
        @function
        @param response Response to know its status
        @description Provides a handler for errors.
        */
        function restErrorHandler(response) {
            $log.error("Error with status code", response.status);
        }


        return factory;

    }

})();