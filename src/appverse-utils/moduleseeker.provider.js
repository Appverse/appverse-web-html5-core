(function(angular) {
    'use strict';

    angular.module('appverse.utils').provider('ModuleSeeker', ModuleSeeker);

    /**
     * @ngdoc service
     * @name ModuleSeeker
     * @module appverse.utils
     * @description Looks for modules
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