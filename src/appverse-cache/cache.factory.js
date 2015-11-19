(function () {
    'use strict';

    angular.module('appverse.cache')

    /**
     * @ngdoc service
     * @name avCacheFactory
     * @module appverse.cache
     *
     * @description
     * Returns an object that exposes methods for cache management.
     *
     * @requires http://jmdobry.github.io/angular-cache/ $angularCacheFactory
     * @requires https://docs.angularjs.org/api/ng/service/$http $http
     * @requires CACHE_CONFIG
     */
    .factory('avCacheFactory',
        function (CacheFactory, $http, CACHE_CONFIG) {

            var factory = {
                _scopeCache: null,
                _browserCache: null,
                _httpCache: null
            };

            /**
             * @ngdoc method
             * @name avCacheFactory#setScopeCache
             *
             * @param {number} duration Items expire after this time.
             * @param {number} capacity Turns the cache into LRU (Least Recently Used) cache.
             * If you don't want $http's default cache to store every response.
             *
             * @description Configure the scope cache.
             */
            factory.setScopeCache = function (duration, capacity) {

                var options = {
                    maxAge: duration,
                    capacity: capacity
                };

                var cache = CacheFactory.get(CACHE_CONFIG.DefaultScopeCacheName);

                if (cache) {
                    cache.setOptions(options);
                    factory._scopeCache = cache;
                } else {
                    factory._scopeCache = CacheFactory.createCache(CACHE_CONFIG.DefaultScopeCacheName, options);
                }
                return factory._scopeCache;
            };

            /**
             * @ngdoc method
             * @name avCacheFactory#getScopeCache
             *
             * @description getScopeCache is the singleton that avCacheFactory
             * manages as a local cache created with $angularCacheFactory,
             * which is what we return from the service.
             * Then, we can inject this into any controller we want and it will always return the same values.
             *
             * The newly created cache object has the following set of methods:
             *
             * * {object} info() — Returns id, size, and options of cache.
             *
             * * {{*}} put({string} key, {*} value) — Puts a new key-value pair into the cache and returns it.
             *
             * * {{*}} get({string} key) — Returns cached value for key or undefined for cache miss.
             *
             * * {void} remove({string} key) — Removes a key-value pair from the cache.
             *
             * * {void} removeAll() — Removes all cached values.
             *
             * * {void} destroy() — Removes references to this cache from $angularCacheFactory.
             */
            factory.getScopeCache = function () {
                return factory._scopeCache || factory.setScopeCache(CACHE_CONFIG.ScopeCache_duration,
                    CACHE_CONFIG.ScopeCache_capacity);
            };

            /**
             @ngdoc function
             @name avCacheFactory#setBrowserStorage

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
             * {void} $reset() - Clears the Storage in one go.
             */
            factory.setBrowserStorage = function (
                type,
                maxAgeInit,
                cacheFlushIntervalInit,
                deleteOnExpireInit,
                verifyIntegrityInit
            ) {

                var selectedStorageType;
                if (type === '2') {
                    selectedStorageType = CACHE_CONFIG.SessionBrowserStorage;
                } else {
                    selectedStorageType = CACHE_CONFIG.LocalBrowserStorage;
                }

                var options = {
                    maxAge: maxAgeInit,
                    cacheFlushInterval: cacheFlushIntervalInit,
                    deleteOnExpire: deleteOnExpireInit,
                    storageMode: selectedStorageType,
                    verifyIntegrity: verifyIntegrityInit
                };

                var cache = CacheFactory.get(CACHE_CONFIG.DefaultBrowserCacheName);

                if (cache) {
                    cache.setOptions(options);
                    factory._browserCache = cache;
                } else {
                    factory._browserCache = CacheFactory.createCache(CACHE_CONFIG.DefaultBrowserCacheName, options);
                }
                return factory._browserCache;
            };

            /**
             * @ngdoc method
             * @name avCacheFactory#setDefaultHttpCacheStorage
             *
             * @param {number} duration items expire after this time.
             * @param {string} capacity  turns the cache into LRU (Least Recently Used) cache.
             * @description Default cache configuration for $http service
             */
            factory.setDefaultHttpCacheStorage = function (maxAge, capacity) {

                var cacheId = 'MyHttpAngularCache';
                factory._httpCache = CacheFactory.get(cacheId);

                if (!factory._httpCache) {
                    factory._httpCache = CacheFactory.createCache(cacheId, {
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
             * @name avCacheFactory#getHttpCache
             * @methodOf avCacheFactory
             * @description Returns the httpcache object in factory
             * @returns httpcache object
             */
            factory.getHttpCache = function () {
                return factory._httpCache;
            };

            return factory;
        }

    );
})();
