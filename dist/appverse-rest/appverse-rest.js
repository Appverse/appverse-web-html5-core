(function () {
    'use strict';

    run.$inject = ["$injector", "$log", "Restangular", "ModuleSeeker", "REST_CONFIG"];
    var requires = [
        'restangular',
        'appverse.configuration',
        'appverse.utils'
    ];

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
    angular.module('appverse.rest', requires).run(run);


    function run($injector, $log, Restangular, ModuleSeeker, REST_CONFIG) {

        tryToIntegrateSecurity();
        tryToIntegrateCache();

        Restangular.setBaseUrl(REST_CONFIG.BaseUrl);
        Restangular.setExtraFields(REST_CONFIG.ExtraFields);
        Restangular.setParentless(REST_CONFIG.Parentless);
        var transformer;
        for (var i = 0; i < REST_CONFIG.ElementTransformer.length; i++) {
            $log.debug('Adding transformer');
            transformer = REST_CONFIG.ElementTransformer[i];
            Restangular.addElementTransformer(transformer.route, transformer.transformer);
        }
        Restangular.setOnElemRestangularized(REST_CONFIG.OnElemRestangularized);

        if (typeof REST_CONFIG.RequestInterceptor === 'function') {
            $log.debug('Setting RequestInterceptor');
            Restangular.setRequestInterceptor(REST_CONFIG.RequestInterceptor);
        }
        if (typeof REST_CONFIG.FullRequestInterceptor === 'function') {
            $log.debug('Setting FullRequestInterceptor');
            Restangular.setFullRequestInterceptor(REST_CONFIG.FullRequestInterceptor);
        }
        Restangular.setErrorInterceptor(REST_CONFIG.ErrorInterceptor);
        Restangular.setRestangularFields(REST_CONFIG.RestangularFields);
        Restangular.setMethodOverriders(REST_CONFIG.MethodOverriders);
        Restangular.setFullResponse(REST_CONFIG.FullResponse);
        //Restangular.setDefaultHeaders(REST_CONFIG.DefaultHeaders);
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

            restFactory.enableDefaultContentType();
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

        $log.info('appverse.rest run');

    }







})();

(function () {
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
         * Retrieves JSON data
         *
         * @example
         <div av-rest-get="accounts" ng-repeat="account in accounts">
            <p ng-bind="account.name"></p>
            <p ng-bind="account.total"></p>
         </div>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         * @requires  Restangular
         */
        ["$log", "Restangular", "$rootScope", "$timeout", "REST_CONFIG", function ($log, Restangular, $rootScope, $timeout, REST_CONFIG) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

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

                    scope.$watchCollection(function () {
                        return [attrs.avRestGet, attrs.restId, attrs.restName];
                    }, function (newCollection, oldCollection, scope) {
                        $log.debug('avRestGet watch ' + name + ':', newCollection);
                        scope[name + errorSuffix] = false;

                        if (attrs.restId) {
                            Restangular.all(attrs.avRestGet).one(attrs.restId).get().then(onSuccess, onError);
                        } else {
                            Restangular.all(attrs.avRestGet).getList().then(onSuccess, onError);
                        }

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function () {
                                scope[name + gettingSuffix] = false;
                                if (scope.$headerContainer) {
                                    scope.$parent[name] = data;
                                } else {
                                    scope[name] = data;
                                }
                            }, REST_CONFIG.Timeout);
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            $timeout(function () {
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
         * Retrieves JSON data
         *
         * @example
         <button av-rest-remove="account"></button>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         */
        ["$log", "$rootScope", "$timeout", "REST_CONFIG", function ($log, $rootScope, $timeout, REST_CONFIG) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

                        var removingSuffix = 'Removing',
                            errorSuffix = 'Error',
                            item = scope.$eval(attrs.avRestRemove),
                            name = item.route.split('/').reverse()[0];

                        $log.debug('avRestRemove directive', item);

                        if (attrs.restIf && !scope.$eval(attrs.restIf)) {
                            return;
                        }

                        scope[name + removingSuffix] = true;
                        scope[name + errorSuffix] = false;

                        item.remove().then(onSuccess, onError);

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function () {
                                scope[name + removingSuffix] = false;
                                var collection = item.getParentList(),
                                    index = collection.indexOf(item);
                                if (index > -1) {
                                    collection.splice(index, 1);
                                }
                            }, REST_CONFIG.Timeout);
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            $timeout(function () {
                                scope[name + removingSuffix] = false;
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
         * Retrieves JSON data
         *
         * @example
         <button av-rest-save="account"></button>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         */
        ["$log", "$rootScope", "Restangular", "$timeout", "REST_CONFIG", function ($log, $rootScope, Restangular, $timeout, REST_CONFIG) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

                        var savingSuffix = 'Saving',
                            errorSuffix = 'Error',
                            item = scope.$eval(attrs.avRestSave),
                            collection = item.getParentList(),
                            index = collection.indexOf(item),
                            name = collection.route.split('/').reverse()[0];

                        $log.debug('avRestSave directive', item);

                        if (attrs.restIf && !scope.$eval(attrs.restIf)) {
                            return;
                        }

                        scope[name + savingSuffix] = true;
                        scope[name + errorSuffix] = false;

                        delete item.editing;
                        if (item.fromServer) {
                            item.put().then(onSuccess, onError);
                        } else {
                            collection.post(item).then(onSuccess, onError);
                        }

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function () {
                                scope[name + savingSuffix] = false;
                                collection[index] = item;
                            }, REST_CONFIG.Timeout);
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            $timeout(function () {
                                scope[name + savingSuffix] = false;
                                scope[name + errorSuffix] = true;

                                if (index > -1) {
                                    if (item.fromServer) {
                                        collection.splice(index, 1, scope.copy);
                                    } else {
                                        collection.splice(index, 1);
                                    }
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
         * Retrieves JSON data
         *
         * @example
         <button av-rest-add="users"></button>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         */
        ["$log", function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

                        var collection = scope.$eval(attrs.avRestAdd);

                        $log.debug('avRestAdd directive', collection);

                        collection.unshift({
                            editing: true,
                            getParentList: function () {
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
         * Retrieves JSON data
         *
         * @example
         <button av-rest-clone="user"></button>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         */
        ["$log", function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

                        var item = scope.$eval(attrs.avRestClone),
                            collection = item.getParentList();

                        $log.debug('avRestClone directive', item);

                        var copy = item.clone();
                        copy.fromServer = false;
                        copy.editing = true;
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
         * Retrieves JSON data
         *
         * @example
         <button av-rest-edit="user"></button>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         */
        ["$log", function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

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
         * Retrieves JSON data
         *
         * @example
         <button av-rest-cancel="user"></button>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         */
        ["$log", function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

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