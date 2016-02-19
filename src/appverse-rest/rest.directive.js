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
        function ($log, Restangular, $rootScope, $timeout, REST_CONFIG, RESTFactory) {
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
         * Calls Restangular remove function on object passed as attribute value.
         *
         *     <button av-rest-remove="account"></button>
         *
         * @param {string} restIf Expression to evaluate and stop execution if returns false.
         */
        function ($log, $rootScope, $timeout, REST_CONFIG, RESTFactory) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

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
                            $timeout(function () {
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
                            $timeout(function () {
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
        })

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
        function ($log, $rootScope, Restangular, $timeout, REST_CONFIG, RESTFactory) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

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

                        delete item.editing;

                        if (item.fromServer) {
                            item.put().then(onSuccess, onError);
                        } else {
                            delete item[Restangular.configuration.restangularFields.id];
                            collection.post(item).then(onSuccess, onError);
                        }

                        collection.some(function (element, idx) {
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
                            $timeout(function () {
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
                            $timeout(function () {
                                scope[name + errorSuffix] = true;

                                if (index > -1) {
                                    delete collection[index][savingProperty];
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
         * Adds an empty object to the Restangular list passed as attribute value. The empty object is added the editing property to true.
         *
         *     <button av-rest-add="users"></button>
         */
        function ($log) {
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
        })

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
        function ($log) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    element.bind('click', function () {

                        var item = scope.$eval(attrs.avRestClone),
                            collection = item.getParentList();

                        $log.debug('avRestClone directive', item);

                        var copy = item.clone();
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
         * Clones the object passed as attribute value and store it in the copy variable. Then, sets the editing property to true.
         *
         *     <button av-rest-edit="user"></button>
         */
        function ($log) {
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
        })

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
        function ($log) {
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
        });
})();
