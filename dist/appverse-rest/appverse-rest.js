(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.rest
     * @description
     *
     * The Integrated REST module includes communication.
     *
     * It is based on Restangular.
     *
     * Params configuration are set in app-configuration file as constants.
     *
     * ## Services Client Configuration
     *
     * The common API includes configuration for one set of REST resources client (1 base URL).
     * This is the most common approach in the most of projects.
     * In order to build several sets of REST resources (several base URLs) you should
     * create scoped configurations. Please, review the below snippet:
     *
     *     var MyRestangular = Restangular.withConfig(function(RestangularConfigurer) {
     *       RestangularConfigurer.setDefaultHeaders({'X-Auth': 'My Name'})
     *     });
     *
     *     MyRestangular.one('place', 12).get();
     *
     * The MyRestangular object has scoped properties of the Restangular on with a different
     * configuration.
     *
     * @requires  https://github.com/mgonto/restangular restangular
     * @requires  appverse.configuration
     * @requires  appverse.utils
     *
     */
    angular.module('appverse.rest', [
        'restangular',
        'appverse.configuration',
        'appverse.utils'
    ])

    .run(["$injector", "$log", "Restangular", "ModuleSeeker", "REST_CONFIG", function($injector, $log, Restangular, ModuleSeeker, REST_CONFIG) {

        $log.info('appverse.rest run');

        tryToIntegrateSecurity();
        tryToIntegrateCache();

        Restangular.setBaseUrl(REST_CONFIG.BaseUrl);
        Restangular.setExtraFields(REST_CONFIG.ExtraFields);
        Restangular.setParentless(REST_CONFIG.Parentless);
        Restangular.setRestangularFields(REST_CONFIG.RestangularFields);
        Restangular.setMethodOverriders(REST_CONFIG.MethodOverriders);
        Restangular.setFullResponse(REST_CONFIG.FullResponse);
        if (REST_CONFIG.DefaultHeaders) {
            Restangular.setDefaultHeaders(REST_CONFIG.DefaultHeaders);
        }
        Restangular.setRequestSuffix(REST_CONFIG.RequestSuffix);
        Restangular.setUseCannonicalId(REST_CONFIG.UseCannonicalId);
        Restangular.setEncodeIds(REST_CONFIG.EncodeIds);

        function tryToIntegrateSecurity() {
            var restFactory = $injector.get('RESTFactory'),
                $log = $injector.get('$log'),
                SECURITY_GENERAL = $injector.get('SECURITY_GENERAL');

            if (ModuleSeeker.exists('appverse.security')) {
                var oauthRequestWrapperService = $injector.get('Oauth_RequestWrapper');
                if (SECURITY_GENERAL.securityEnabled) {
                    restFactory.wrapRequestsWith(oauthRequestWrapperService);
                    $log.debug("REST communication is secure. Security is enabled." +
                        " REST requests will be wrapped with authorization headers.");
                    return;
                }
            }

            $log.debug("REST communication is not secure. Security is not enabled.");
        }

        function tryToIntegrateCache() {
            if (ModuleSeeker.exists('appverse.cache')) {
                var restFactory = $injector.get('RESTFactory'),
                    avCacheFactory = $injector.get('avCacheFactory'),
                    cache = avCacheFactory.getHttpCache();
                restFactory.setCache(cache);
            }
        }

        if (REST_CONFIG.HATEOAS) {

            var CONTENT_TAG = 'content';
            var HREF_TAG = 'href';
            var LINKS_TAG = 'links';

            Restangular.setResponseExtractor(function(data, operation) {
                var returnData = data;
                if (operation === 'getList' && CONTENT_TAG in data) {
                    for (var i = 0; i < data[CONTENT_TAG].length; i++) {
                        data[CONTENT_TAG][i][HREF_TAG] = data[CONTENT_TAG][i][LINKS_TAG][0][HREF_TAG];
                        delete data[CONTENT_TAG][i][LINKS_TAG];
                    }
                    returnData = data[CONTENT_TAG];
                    delete data[CONTENT_TAG];
                    for (var key in data) {
                        returnData[key] = data[key];
                    }
                }
                return returnData;
            });
        }
    }]);

})();
(function() {
    'use strict';

    angular.module('appverse.rest')

    .directive('avRestGet',

        /**
         * @ngdoc directive
         * @name avRestGet
         * @module appverse.rest
         * @restrict A
         *
         * @description
         * Retrieves JSON data using Restangular API. By default it will retrieve a list. If rest-id attribute is set, it will retrieve an object.
         *
         *      <div av-rest-get="accounts" ng-repeat="account in accounts">
         *          <p ng-bind="account.name"></p>
         *          <p ng-bind="account.total"></p>
         *      </div>
         *
         * @param {string} restName Name of the scope variable to store the results.
         * @param {string} restId Id of the object to get through <b>Restangular.one()</b>.
         */
        ["$log", "Restangular", "$rootScope", "$timeout", "REST_CONFIG", "RESTFactory", function($log, Restangular, $rootScope, $timeout, REST_CONFIG, RESTFactory) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    $log.debug('avRestGet directive', attrs);

                    var gettingSuffix = 'Getting',
                        errorSuffix = 'Error',
                        name;

                    if (attrs.restName) {
                        name = attrs.restName;
                    } else {
                        name = attrs.avRestGet.split('/').reverse()[0];

                        if (attrs.restId && name.charAt(name.length - 1) === 's') {
                            name = name.substr(0, name.length - 1);
                        }
                    }

                    scope[name + gettingSuffix] = true;

                    scope.$watchCollection(function() {
                        return [attrs.avRestGet, attrs.restId, attrs.restName];
                    }, function(newCollection, oldCollection, scope) {
                        $log.debug('avRestGet watch ' + name + ':', newCollection);
                        scope[name + errorSuffix] = false;

                        if (attrs.restId) {
                            Restangular.all(attrs.avRestGet).one(attrs.restId).get().then(onSuccess, onError);
                        } else {
                            Restangular.all(attrs.avRestGet).getList().then(onSuccess, onError);
                        }

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function() {
                                scope[name + gettingSuffix] = false;
                                scope[name] = data;
                                var func = RESTFactory.afterRoute[name];
                                if (func) {
                                    func();
                                }
                                if (attrs.restThen) {
                                    scope.$eval(attrs.restThen);
                                }
                            }, REST_CONFIG.Timeout);
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            $timeout(function() {
                                scope[name + gettingSuffix] = false;
                                scope[name + errorSuffix] = true;
                                if (!$rootScope[name + 'Errors']) {
                                    $rootScope[name + 'Errors'] = [];
                                }
                                $rootScope[name + 'Errors'].push(response);
                            }, REST_CONFIG.Timeout);
                        }
                    });
                }
            };
        }])

    .directive('avRestRemove',

        /**
         * @ngdoc directive
         * @name avRestRemove
         * @module appverse.rest
         * @restrict A
         *
         * @description
         * Calls Restangular remove function on object passed as attribute value.
         *
         *     <button av-rest-remove="account"></button>
         *
         * @param {string} restIf Expression to evaluate and stop execution if returns false.
         */
        ["$log", "$rootScope", "$timeout", "REST_CONFIG", "RESTFactory", function($log, $rootScope, $timeout, REST_CONFIG, RESTFactory) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        var removingProperty = '$removing',
                            errorSuffix = 'Error',
                            item = scope.$eval(attrs.avRestRemove),
                            name = item.route.split('/').reverse()[0];

                        $log.debug('avRestRemove directive', item);

                        if (attrs.restIf && !scope.$eval(attrs.restIf)) {
                            return;
                        }

                        item[removingProperty] = true;
                        var func = RESTFactory.afterRoute[name];
                        if (func) {
                            func();
                        }

                        item.remove().then(onSuccess, onError);

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function() {
                                var collection;
                                if (item.getParentList) {
                                    collection = item.getParentList();
                                } else {
                                    collection = scope[name];
                                }
                                var index = collection.indexOf(item);
                                if (index > -1) {
                                    collection.splice(index, 1);
                                    var func = RESTFactory.afterRoute[name];
                                    if (func) {
                                        func();
                                    }
                                }
                            }, REST_CONFIG.Timeout);
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            $timeout(function() {
                                delete item[removingProperty];
                                scope[name + errorSuffix] = true;
                                if (!$rootScope[name + 'Errors']) {
                                    $rootScope[name + 'Errors'] = [];
                                }
                                $rootScope[name + 'Errors'].push(response);
                            }, REST_CONFIG.Timeout);
                        }

                    });
                }
            };
        }])

    .directive('avRestSave',

        /**
         * @ngdoc directive
         * @name avRestSave
         * @module appverse.rest
         * @restrict A
         *
         * @description
         * Calls post or put on the object passed as attribute value depending on fromServer property value.
         *
         *     <button av-rest-save="account"></button>
         *
         * @param {string} restIf Expression to evaluate and stop execution if returns false.
         */
        ["$log", "$rootScope", "Restangular", "$timeout", "REST_CONFIG", "RESTFactory", function($log, $rootScope, Restangular, $timeout, REST_CONFIG, RESTFactory) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        var savingProperty = '$saving',
                            errorSuffix = 'Error',
                            item = scope.$eval(attrs.avRestSave),
                            collection, index = -1,
                            name;

                        if (item.getParentList) {
                            collection = item.getParentList();
                            name = collection.route.split('/').reverse()[0];
                        } else {
                            name = item.route.split('/').reverse()[0];
                            collection = scope[name];
                        }

                        $log.debug('avRestSave directive', item);

                        if (attrs.restIf && !scope.$eval(attrs.restIf)) {
                            return;
                        }

                        scope[name + errorSuffix] = false;

                        var clone = item.clone();
                        delete clone.editing;

                        if (item.fromServer) {
                            clone.put().then(onSuccess, onError);
                        } else {
                            delete item[Restangular.configuration.restangularFields.id];
                            collection.post(clone).then(onSuccess, onError);
                        }

                        collection.some(function(element, idx) {
                            if (element[Restangular.configuration.restangularFields.id] === item[Restangular.configuration.restangularFields.id]) {
                                index = idx;
                                return true;
                            }
                        });

                        if (index > -1) {
                            collection[index][savingProperty] = true;
                            var func = RESTFactory.afterRoute[name];
                            if (func) {
                                func();
                            }
                        }

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function() {
                                if (item.fromServer) {
                                    collection[index] = data;
                                } else {
                                    collection.push(data);
                                }
                                var func = RESTFactory.afterRoute[name];
                                if (func) {
                                    func();
                                }
                            }, REST_CONFIG.Timeout);
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            $timeout(function() {
                                scope[name + errorSuffix] = true;

                                if (index > -1) {
                                    delete collection[index][savingProperty];
                                }

                                if (!$rootScope[name + 'Errors']) {
                                    $rootScope[name + 'Errors'] = [];
                                }
                                $rootScope[name + 'Errors'].push(response);
                            }, REST_CONFIG.Timeout);
                        }

                    });
                }
            };
        }])

    .directive('avRestAdd',

        /**
         * @ngdoc directive
         * @name avRestAdd
         * @module appverse.rest
         * @restrict A
         *
         * @description
         * Adds an empty object to the Restangular list passed as attribute value. The empty object is added the editing property to true.
         *
         *     <button av-rest-add="users"></button>
         */
        ["$log", function($log) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        var collection = scope.$eval(attrs.avRestAdd);

                        $log.debug('avRestAdd directive', collection);

                        collection.unshift({
                            editing: true,
                            getParentList: function() {
                                return collection;
                            }
                        });

                        scope.$applyAsync();
                    });
                }
            };
        }])

    .directive('avRestClone',

        /**
         * @ngdoc directive
         * @name avRestClone
         * @module appverse.rest
         * @restrict A
         *
         * @description
         * Calls the Restangular clone function on the object passed as attribute value and adds the clone to the beginning of the Restangular collection. The editing property is also set to true on the clone.
         *
         *     <button av-rest-clone="user"></button>
         */
        ["$log", function($log) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        var item = scope.$eval(attrs.avRestClone),
                            collection = item.getParentList();

                        $log.debug('avRestClone directive', item);

                        var copy = item.clone();
                        copy.editing = true;
                        copy.fromServer = false;
                        collection.unshift(copy);

                        scope.$applyAsync();
                    });
                }
            };
        }])

    .directive('avRestEdit',

        /**
         * @ngdoc directive
         * @name avRestEdit
         * @module appverse.rest
         * @restrict A
         *
         * @description
         * Clones the object passed as attribute value and store it in the copy variable. Then, sets the editing property to true.
         *
         *     <button av-rest-edit="user"></button>
         */
        ["$log", function($log) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        var item = scope.$eval(attrs.avRestEdit);

                        $log.debug('avRestEdit directive', item);

                        scope.copy = item.clone();
                        item.editing = true;

                        scope.$applyAsync();
                    });
                }
            };
        }])

    .directive('avRestCancel',

        /**
         * @ngdoc directive
         * @name avRestCancel
         * @module appverse.rest
         * @restrict A
         *
         * @description
         * Removes the Restangular object passed as attribute value and replaces it with the saved copy if needed.
         *
         *     <button av-rest-cancel="user"></button>
         *
         * @param {string} restName Name of the scope variable that contains the collection to modify.
         */
        ["$log", function($log) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        $log.debug('avRestCancel directive', scope);

                        var item = scope.$eval(attrs.avRestCancel),
                            collection;

                        if (item.getParentList) {
                            collection = item.getParentList();
                        } else {
                            collection = scope[attrs.restName || attrs.avRestCancel + 's'];
                        }

                        var index = collection.indexOf(item);

                        if (index > -1) {
                            if (scope.copy) {
                                collection.splice(index, 1, scope.copy);
                            } else {
                                collection.splice(index, 1);
                            }
                        }

                        scope.$applyAsync();
                    });
                }
            };
        }]);
})();
(function () {
    'use strict';

    RESTFactory.$inject = ["$log", "$q", "$http", "Restangular", "REST_CONFIG"];
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

        var factory = {
            afterRoute: {}
        };

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
         * @name RESTFactory#setAfterRoute
         * @param {string} Route as passed to Restangular
         * @param {function} Function to execute
         * @description Adds a function to execute after any REST operation on the given route
         */
        factory.setAfterRoute = function (route, func) {
            factory.afterRoute[route] = func;
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
