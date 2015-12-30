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
        function ($log, Restangular, $rootScope, $timeout, REST_CONFIG) {
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
        })

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
         <button av-rest-delete="account"></button>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         */
        function ($log, $rootScope, $timeout, REST_CONFIG) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.click(function () {

                        var removingSuffix = 'Removing',
                            errorSuffix = 'Error',
                            item = scope.$eval(attrs.avRestRemove),
                            name = attrs.restName || item.route.split('/').reverse()[0];

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
                                var index = scope[name].indexOf(item);
                                if (index > -1) {
                                    scope[name].splice(index, 1);
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
        })

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
         <button av-rest-put="newAccount"></button>
         *
         * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
         */
        function ($log, $rootScope, Restangular, $timeout, REST_CONFIG) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.click(function () {

                        var savingSuffix = 'Saving',
                            errorSuffix = 'Error',
                            item = scope.$eval(attrs.avRestSave),
                            name = attrs.restName;

                        $log.debug('avRestSave directive', item);

                        if (!name) {
                            if (item.route) {
                                name = item.route.split('/').reverse()[0];
                            } else {
                                name = attrs.avRestSave + 's';
                            }
                        }

                        if (attrs.restIf && !scope.$eval(attrs.restIf)) {
                            return;
                        }

                        scope[name + savingSuffix] = true;
                        scope[name + errorSuffix] = false;

                        if (!item.save) {
                            Restangular.restangularizeElement(null, item, name);
                        }
                        item.save().then(onSuccess, onError);

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function () {
                                scope[name + savingSuffix] = false;
                                var index = scope[name].indexOf(item);
                                scope[name][index] = item;
                            }, REST_CONFIG.Timeout);
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            $timeout(function () {
                                scope[name + savingSuffix] = false;
                                scope[name + errorSuffix] = true;

                                if (!item.fromServer) {
                                    var collection = scope[name];
                                    if (!collection) {
                                        collection = scope.$parent[name];
                                    }
                                    var index = collection.indexOf(item);
                                    if (index > -1) {
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
        });


})();
