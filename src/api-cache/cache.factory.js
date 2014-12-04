(function() {
    'use strict';

    angular.module('AppCache')


    .factory('CacheFactory', [
        '$angularCacheFactory',
        '$http',
        'CACHE_CONFIG',
        '$log',
        function($angularCacheFactory, $http, CACHE_CONFIG, $log) {

            var factory = {
                _scopeCache: null,
                _browserCache: null,
                _httpCache: null
            };
        }
    ])

    /**
     * @ngdoc service
     * @name AppCache.service:CacheFactory
     * @requires $angularCacheFactory
     * @requires $http
     * @requires CACHE_CONFIG
     * @description
     * Contains methods for cache management.
     */
    .factory('CacheFactory', ['$angularCacheFactory', '$http', 'CACHE_CONFIG', '$log',
        function($angularCacheFactory, $http, CACHE_CONFIG, $log) {

            var factory = {
                _scopeCache: null,
                _browserCache: null,
                _httpCache: null
            };

            /**
             * @ngdoc method
             * @name AppCache.service:CacheFactory#setScopeCache
             * @methodOf AppCache.service:CacheFactory
             * @param {number} duration Items expire after this time.
             * @param {number} capacity Turns the cache into LRU (Least Recently Used) cache. If you don't want $http's default cache to store every response.
             * @description Configure the scope cache.
             */
            factory.setScopeCache = function(duration, capacity) {
                factory._scopeCache = $angularCacheFactory(CACHE_CONFIG.DefaultScopeCacheName, {
                    maxAge: duration,
                    capacity: capacity
                });
                return factory._scopeCache;
            };

            /**
             * @ngdoc method
             * @name AppCache.service:CacheFactory#getScopeCache
             * @methodOf AppCache.service:CacheFactory
             * @description getScopeCache is the singleton that CacheFactory manages as a local cache created with $angularCacheFactory, which is what we return from the service. Then, we can inject this into any controller we want and it will always return the same values.
             *
             * The newly created cache object has the following set of methods:
             *
             * {object} info() — Returns id, size, and options of cache.
             *
             * {{*}} put({string} key, {*} value) — Puts a new key-value pair into the cache and returns it.
             *
             * {{*}} get({string} key) — Returns cached value for key or undefined for cache miss.
             *
             * {void} remove({string} key) — Removes a key-value pair from the cache.
             *
             * {void} removeAll() — Removes all cached values.
             *
             * {void} destroy() — Removes references to this cache from $angularCacheFactory.
             */
            factory.getScopeCache = function() {
                return factory._scopeCache || factory.setScopeCache(CACHE_CONFIG.ScopeCache_duration,
                        CACHE_CONFIG.ScopeCache_capacity);
            };

            /**
             @function
             @param type Type of storage ( 1 local | 2 session).
             @param maxAgeInit
             @param cacheFlushIntervalInit
             @param deleteOnExpireInit

             @description This object makes Web Storage working in the Angular Way.
             By default, web storage allows you 5-10MB of space to work with, and your data is stored locally
             on the device rather than passed back-and-forth with each request to the server.
             Web storage is useful for storing small amounts of key/value data and preserving functionality
             online and offline.
             With web storage, both the keys and values are stored as strings.

             We can store anything except those not supported by JSON:
             Infinity, NaN - Will be replaced with null.
             undefined, Function - Will be removed.
             The returned object supports the following set of methods:
             {void} $reset() - Clears the Storage in one go.
             */

            factory.setBrowserStorage = function(type, maxAgeInit, cacheFlushIntervalInit, deleteOnExpireInit, verifyIntegrityInit) {
                //$log.debug('type: ' + type);
                var selectedStorageType;
                if (type == '2') {
                    selectedStorageType = CACHE_CONFIG.SessionBrowserStorage;
                } else {
                    selectedStorageType = CACHE_CONFIG.LocalBrowserStorage;
                }
                //$log.debug('selectedStorageType: ' + selectedStorageType);

                factory._browserCache = $angularCacheFactory(CACHE_CONFIG.DefaultBrowserCacheName, {
                    maxAge: maxAgeInit,
                    cacheFlushInterval: cacheFlushIntervalInit,
                    deleteOnExpire: deleteOnExpireInit,
                    storageMode: selectedStorageType,
                    verifyIntegrity: verifyIntegrityInit
                });
                return factory._browserCache;
            };


            /*
             @function
             @param duration items expire after this time.
             @param capacity  turns the cache into LRU (Least Recently Used) cache.
             If you don't want $http's default cache to store every response.
             @description Http Cache Storage is the object to handle and configure the features
             of the cache for default use with the $http service.
             @description
             Your can retrieve the currently cached data: var cachedData =
             */
            factory.setDefaultHttpCacheStorage = function(maxAge, capacity) {
                return factory._browserCache;
            };


            /**
             * @ngdoc method
             * @name AppCache.service:CacheFactory#setDefaultHttpCacheStorage
             * @methodOf AppCache.service:CacheFactory
             * @param {number} duration items expire after this time.
             * @param {string} capacity  turns the cache into LRU (Least Recently Used) cache.
             * @description Default cache configuration for $http service
             */
            factory.setDefaultHttpCacheStorage = function(maxAge, capacity) {

                var cacheId = 'MyHttpAngularCache';
                factory._httpCache = $angularCacheFactory.get(cacheId);

                if (!factory._httpCache) {
                    factory._httpCache = $angularCacheFactory(cacheId, {
                        // This cache can hold x items
                        capacity: capacity,
                        // Items added to this cache expire after x milliseconds
                        maxAge: maxAge,
                        // Items will be actively deleted when they expire
                        deleteOnExpire: 'aggressive',
                        // This cache will check for expired items every x milliseconds
                        recycleFreq: 15000,
                        // This cache will clear itself every x milliseconds
                        cacheFlushInterval: 15000,
                        // This cache will sync itself with localStorage
                        //                        storageMode: 'localStorage',

                        // Custom implementation of localStorage
                        //storageImpl: myLocalStoragePolyfill,

                        // Full synchronization with localStorage on every operation
                        verifyIntegrity: true
                    });
                } else {
                    factory._httpCache.setOptions({
                        // This cache can hold x items
                        capacity: capacity,
                        // Items added to this cache expire after x milliseconds
                        maxAge: maxAge,
                        // Items will be actively deleted when they expire
                        deleteOnExpire: 'aggressive',
                        // This cache will check for expired items every x milliseconds
                        recycleFreq: 15000,
                        // This cache will clear itself every x milliseconds
                        cacheFlushInterval: 15000,
                        // This cache will sync itself with localStorage
                        storageMode: 'localStorage',
                        // Custom implementation of localStorage
                        //storageImpl: myLocalStoragePolyfill,

                        // Full synchronization with localStorage on every operation
                        verifyIntegrity: true
                    });
                }
                $http.defaults.cache = factory._httpCache;
                return factory._httpCache;
            };

            /**
             * @ngdoc method
             * @name AppCache.service:CacheFactory#getHttpCache
             * @methodOf AppCache.service:CacheFactory
             * @description Returns the httpcache object in factory
             * @returns httpcache object
             */
            factory.getHttpCache = function() {
                return factory._httpCache;
            };

            return factory;
        }
    ]);

})();
