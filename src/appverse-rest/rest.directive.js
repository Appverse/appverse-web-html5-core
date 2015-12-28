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
        function ($log, Restangular) {
            return {
                link: function (scope, element, attrs) {

                    $log.debug('avRestGet directive', attrs);

                    var loadingSuffix = 'Loading',
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

                    scope[name + loadingSuffix] = true;

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
                            scope.$parent[name] = data;
                            scope[name + loadingSuffix] = false;
                        }

                        function onError() {
                            $log.debug('onError');
                            scope[name + loadingSuffix] = false;
                            scope[name + errorSuffix] = true;
                        }
                    });
                }
            };
        })

    .directive('avRestDelete',

        /**
         * @ngdoc directive
         * @name avRestDelete
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
        function ($log, $rootScope) {
            return {
                link: function (scope, element, attrs) {

                    element.click(function () {

                        var deletingSuffix = 'Deleting',
                            errorSuffix = 'Error',
                            element = scope.$eval(attrs.avRestDelete),
                            name = attrs.restName || element.route.split('/').reverse()[0];

                        $log.debug('avRestDelete directive', element);

                        if (attrs.restClick && !scope.$eval(attrs.restClick)) {
                            return;
                        }

                        scope[name + deletingSuffix] = true;
                        scope[name + errorSuffix] = false;

                        element.remove().then(onSuccess, onError);

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            var index = scope[name].indexOf(element);
                            if (index > -1) {
                                scope[name].splice(index, 0);
                            }
                            scope[name + deletingSuffix] = false;
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            scope[name + deletingSuffix] = false;
                            scope[name + errorSuffix] = true;
                            if (!$rootScope[name + 'Errors']) {
                                $rootScope[name + 'Errors'] = [];
                            }
                            $rootScope[name + 'Errors'].push({
                                response: response,
                                element: element
                            });
                        }

                    });
                }
            };
        })

    .directive('avRestSave',

        /**
         * @ngdoc directive
         * @name avRestPut
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
        function ($log, $rootScope) {
            return {
                link: function (scope, element, attrs) {

                    element.click(function () {

                        var updatingSuffix = 'Updating',
                            errorSuffix = 'Error',
                            element = scope.$eval(attrs.avRestPut),
                            name = attrs.restName || element.route.split('/').reverse()[0];

                        $log.debug('avRestPut directive', element);

                        if (attrs.restClick && !scope.$eval(attrs.restClick)) {
                            return;
                        }

                        scope[name + updatingSuffix] = true;
                        scope[name + errorSuffix] = false;

                        element.put().then(onSuccess, onError);

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            var index = scope[name].indexOf(element);
                            scope[name][index] = element;
                            scope[name + updatingSuffix] = false;
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            scope[name + updatingSuffix] = false;
                            scope[name + errorSuffix] = true;
                            if (!$rootScope[name + 'Errors']) {
                                $rootScope[name + 'Errors'] = [];
                            }
                            $rootScope[name + 'Errors'].push({
                                response: response,
                                element: element
                            });
                        }

                    });
                }
            };
        });


})();