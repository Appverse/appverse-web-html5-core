(function () {
    'use strict';

    angular.module('appverse.utils')

    /**
     * @ngdoc service
     * @name UtilFactory
     * @module appverse.utils
     * @description This factory provides common utilities for API functionalities.
     */
    .factory('UtilFactory', function () {
        var factory = {};

        /**
         * @ngdoc method
         * @name UtilFactory#findPropertyValueByName
         * @description Deletes an item from a list.
         *
         * @param properties content of the static external properties file
         * @param area group of properties
         * @param property property to know the value in
         */
        factory.findPropertyValueByName = function (properties, area, property) {
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].area === area) {
                    for (var p = 0; p < properties[i].properties.length; p++) {
                        if (properties[i].properties[p].property === property) {
                            return properties[i].properties[p].value;
                        }
                    }
                }
            }
            return null;
        };

        /**
         * @ngdoc method
         * @name UtilFactory#newRandomKey
         * @description ...
         *
         * @param coll
         * @param key
         * @param currentKey
         */
        factory.newRandomKey = function (coll, key, currentKey) {
            var randKey;
            do {
                randKey = coll[Math.floor(coll.length * Math.random())][key];
            } while (randKey === currentKey);
            return randKey;
        };

        return factory;
    });

})();
