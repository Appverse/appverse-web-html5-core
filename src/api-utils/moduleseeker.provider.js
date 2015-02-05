(function(angular) {
    'use strict';

    angular.module('AppUtils').provider('ModuleSeeker', ModuleSeeker);

    /**
     * @ngdoc service
     * @name AppUtils.provider:ModuleSeeker
     * @description
     * Seeks and check existance of modules
     */
    function ModuleSeeker() {
        this.$get = function() {
            return this;
        };
    }

    /**
     * $ngdoc function
     * @description Checks if the module exists
     * @param  {string} name Name of the module
     * @return {Boolean}
     */
    ModuleSeeker.prototype.exists = function(name) {
        try {
            angular.module(name);
            return true;
        } catch (e) {
            return false;
        }
    };

})(angular);