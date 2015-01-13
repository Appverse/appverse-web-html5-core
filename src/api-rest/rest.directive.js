(function() {
    'use strict';

    angular.module('AppREST')
    .directive('rest', restDirective);

    /**
     * @ngdoc directive
     * @name rest
     * @module AppREST
     * @restrict A
     *
     * @description
     * Retrieves JSON data
     *
     * @example
     <example module="AppREST">
       <file name="index.html">
         <p>REST test</p>
         <div rest rest-path="" rest-id="" rest-name="" rest-loading-text="" rest-error-text="" />
       </file>
     </example>
     */
    function restDirective ($log, RESTFactory) {
        return {
            link: function (scope, element, attrs) {

                var defaultName = 'restData',
                    loadingSuffix = 'Loading',
                    errorSuffix = 'Error',
                    name = attrs.restName || defaultName,
                    path = attrs.rest || attrs.restPath;

                $log.debug('rest directive');

                scope[name + loadingSuffix] = true;
                element.html(attrs.restLoadingText || "");

                scope.$watchCollection(function () {
                    return [path, name, attrs.restErrorText, attrs.restLoadingText];
                }, function (newCollection, oldCollection, scope) {
                    $log.debug('REST watch ' + name + ':', newCollection);
                    scope[name + errorSuffix] = false;

                    var object;
                    if (attrs.restId) {
                        object = RESTFactory.readListItem(path, attrs.restId, onSuccess, onError);
                    } else {
                        object = RESTFactory.readObject(path, onSuccess, onError);
                    }

                    function onSuccess(data) {
                        $log.debug('get data', data);
                        element.html("");
                        scope[name] = data;
                        scope[name + loadingSuffix] = false;
                    }

                    function onError() {
                        element.html(attrs.restErrorText || "");
                        scope[name + loadingSuffix] = false;
                        scope[name + errorSuffix] = true;
                    }

                });
            }
        };
    }


})();