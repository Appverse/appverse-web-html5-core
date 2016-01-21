(function(angular) {
    'use strict';

    angular.module('appverse.utils')

    /**
     * @ngdoc provider
     * @name BaseUrlSetter
     * @module appverse.utils
     * @description
     * Preprends a url with a base path
     */
    .provider('BaseUrlSetter', BaseUrlSetterProvider);

    function BaseUrlSetterProvider() {
        this.$get = function() {
            return this;
        };

        /**
         * @ngdoc method
         * @name BaseUrlSetter#setBasePath
         * @param {string} basePath The base path to prepend
         */
        this.setBasePath = function(basePath) {
            return new BaseUrlSetter(basePath);
        };
    }


    function BaseUrlSetter(basePath) {

        basePath = basePath || '';

        basePath = basePath.trim(basePath);

        this.$get = function() {
            return this;
        };

        this.inUrl = function(url) {
            url = url.trim(url);
            if (endsWithSlash(basePath)) {
                basePath = sliceLastChar(basePath);
            }
            if (startsWithSlash(url)) {
                url = sliceFirstChar(url);
            }
            return basePath + '/' + url;
        };

        function endsWithSlash(path) {
            return (path.slice(-1) === '/');
        }

        function startsWithSlash(path) {
            return (path.slice(0, 1) === '/');
        }

        function sliceLastChar(path) {
            return path.slice(0, -1);
        }

        function sliceFirstChar(path) {
            return path.slice(1);
        }
    }





})(angular);
