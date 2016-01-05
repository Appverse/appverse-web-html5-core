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
                            collection = item.getParentList(),
                            index = collection.indexOf(item),
                            name = collection.route.split('/').reverse()[0];

                        $log.debug('avRestSave directive', item);

                        if (attrs.restIf && !scope.$eval(attrs.restIf)) {
                            return;
                        }

                        scope[name + savingSuffix] = true;
                        scope[name + errorSuffix] = false;

                        if (item.save) {
                            delete item.editing;
                        } else {
                            Restangular.restangularizeElement(null, item, name);
                        }
                        item.save().then(onSuccess, onError);

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

                                collection = item.getParentList();

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
        })

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
        function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.click(function () {

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
        })

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
        function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.click(function () {

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
        })

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
        function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.click(function () {

                        var item = scope.$eval(attrs.avRestEdit);

                        $log.debug('avRestEdit directive', item);

                        scope.copy = item.clone();
                        item.editing = true;

                        scope.$applyAsync();
                    });
                }
            };
        })

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
        function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.click(function () {

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
        });
})();
