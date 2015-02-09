(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.cache
     * @requires AppConfiguration
     * @description
     * The Cache module includes several types of cache.
     *
     * Scope Cache: To be used in a limited scope. It does not persist when navigation.
     *
     * Browser Storage: It handles short strings into local or session storage. Access is synchronous.
     *
     * IndexedDB: It initializes indexed database at browser to handle data structures. Access is asynchronous.
     *
     * Http Cache: It initializes cache for the $httpProvider. $http service instances will use this cache.
     *
     * WARNING - HTTP Service Cache:
     *
     * The rest module handles its own cache. So, HttpCache affects only to manually created $http objects.
     *
     * WARNING - IndexedDB Usage:
     *
     * IndexedDB works both online and offline, allowing for client-side storage of large amounts of
     * structured data, in-order key retrieval, searches over the values stored, and the option to
     *  store multiple values per key.
     *
     * With IndexedDB, all calls are asynchronous and all interactions happen within a transaction.
     *
     * Consider Same-origin policy constraints when accessing the IDB.
     * This module creates a standard default IDB for the application domain.
     *
     * In order to make easiest as possible usage of the API two methods have been defined.
     * The below example shows how to use these object to build custom queries to the IDB
     * considering the initialization parameters:
     * <pre>
     *  function (param){
     *      var queryBuilder = CacheFactory.getIDBQueryBuilder();
     *      var objStore = CacheFactory.getIDBObjectStore();
     *      var myQuery = queryBuilder.$index(CACHE_CONFIG.IndexedDB_mainIndex).$gt(param).$asc.compile;
     *      objStore.each(myQuery).then(function(cursor){
     *          $scope.key = cursor.key;
     *          $scope.value = cursor.value;
     *      });
     *  }
     * </pre>
     */

    angular.module('appverse.cache', ['ng', 'AppConfiguration', 'jmdobry.angular-cache', 'ngResource'])
        .run(run);

    function run($log, CacheFactory, CACHE_CONFIG) {

        $log.info('appverse.cache run');

        /* Initializes the different caches with params in configuration. */
        if (CACHE_CONFIG.ScopeCache_Enabled) {
            CacheFactory.setScopeCache(
                    CACHE_CONFIG.ScopeCache_duration,
                    CACHE_CONFIG.ScopeCache_capacity
                    );
        }

        if (CACHE_CONFIG.BrowserStorageCache_Enabled) {
            CacheFactory.setBrowserStorage(
                    CACHE_CONFIG.BrowserStorage_type,
                    CACHE_CONFIG.MaxAge,
                    CACHE_CONFIG.CacheFlushInterval,
                    CACHE_CONFIG.DeleteOnExpire,
                    CACHE_CONFIG.VerifyIntegrity
                    );
        }

        /* The cache for http calls */
        if (CACHE_CONFIG.HttpCache_Enabled) {
            CacheFactory.setDefaultHttpCacheStorage(
                    CACHE_CONFIG.HttpCache_duration,
                    CACHE_CONFIG.HttpCache_capacity);
        }

    }
    run.$inject = ["$log", "CacheFactory", "CACHE_CONFIG"];

})();

(function(){
    'use strict';

    angular.module('appverse.cache')

    /**
     * @ngdoc directive
     * @name appverse.cache.directive:cache
     * @restrict B
     * @requires $log
     * @requires appverse.cache.factory:CacheFactory
     *
     * @description
     * Use this directive to inject directly in dom nodes caching features for values.
     *
     *
     * @example
     <example module="appverse.cache">
        <file name="index.html">
            <div cache="name" />
            <div cache cache-name="name" />
        </file>
    </example>
     */
    .directive('cache', ['$log', 'CacheFactory', function ($log, CacheFactory) {

        return {
            link: function (scope, element, attrs) {

                var name = attrs.cache || attrs.cacheName;

                scope.$watch(function () {
                    return CacheFactory.getScopeCache().get(name);
                }, function (newVal) {
                    $log.debug('Cache watch {' + name + '}:', newVal);
                    scope[name] = CacheFactory.getScopeCache().get(name);
                });

                scope.$watch(name, function (newVal) {
                    $log.debug('Cache watch {' + name + '}:', newVal);
                    CacheFactory.getScopeCache().put(name, scope[name]);
                });
            }
        };
    }]);


})();
(function() {
    'use strict';

    angular.module('appverse.cache').factory('CacheFactory', CacheFactory);

    /**
     * @ngdoc service
     * @name appverse.cache.service:CacheFactory
     * @requires $angularCacheFactory
     * @requires $http
     * @requires CACHE_CONFIG
     * @description
     * Contains methods for cache management.
     */
    function CacheFactory($angularCacheFactory, $http, CACHE_CONFIG) {

        var factory = {
            _scopeCache: null,
            _browserCache: null,
            _httpCache: null
        };

        /**
         * @ngdoc method
         * @name appverse.cache.service:CacheFactory#setScopeCache
         * @methodOf appverse.cache.service:CacheFactory
         * @param {number} duration Items expire after this time.
         * @param {number} capacity Turns the cache into LRU (Least Recently Used) cache.
         * If you don't want $http's default cache to store every response.
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
         * @name appverse.cache.service:CacheFactory#getScopeCache
         * @methodOf appverse.cache.service:CacheFactory
         * @description getScopeCache is the singleton that CacheFactory
         * manages as a local cache created with $angularCacheFactory,
         * which is what we return from the service.
         * Then, we can inject this into any controller we want and it will always return the same values.
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

        factory.setBrowserStorage = function(
            type,
            maxAgeInit,
            cacheFlushIntervalInit,
            deleteOnExpireInit,
            verifyIntegrityInit
        ) {

            var selectedStorageType;
            if (type == '2') {
                selectedStorageType = CACHE_CONFIG.SessionBrowserStorage;
            } else {
                selectedStorageType = CACHE_CONFIG.LocalBrowserStorage;
            }

            factory._browserCache = $angularCacheFactory(CACHE_CONFIG.DefaultBrowserCacheName, {
                maxAge: maxAgeInit,
                cacheFlushInterval: cacheFlushIntervalInit,
                deleteOnExpire: deleteOnExpireInit,
                storageMode: selectedStorageType,
                verifyIntegrity: verifyIntegrityInit
            });
            return factory._browserCache;
        };

        /**
         * @ngdoc method
         * @name appverse.cache.service:CacheFactory#setDefaultHttpCacheStorage
         * @methodOf appverse.cache.service:CacheFactory
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
         * @name appverse.cache.service:CacheFactory#getHttpCache
         * @methodOf appverse.cache.service:CacheFactory
         * @description Returns the httpcache object in factory
         * @returns httpcache object
         */
        factory.getHttpCache = function() {
            return factory._httpCache;
        };

        return factory;
    }
    CacheFactory.$inject = ["$angularCacheFactory", "$http", "CACHE_CONFIG"];


})();

(function() {
    'use strict';

    angular.module('appverse.cache')

    /**
     * @ngdoc service
     * @name appverse.cache.service:IDBService
     * @description
     * This service has been planned to be used as a simple HTML5's indexedDB specification with the commonAPI.
     * A pre-configured data structure has been included to be used for common purposes:
     * Data Structure Name: 'default'
     * Fields: Id, Title, Body, Tags, Updated.
     * Indexes: Id (Unique), titlelc(Unique), tag(multientry).
     */
    .service('IDBService', ['$q', '$log', function($q, $log) {
        var setUp = false;
        var db;

        var service = {};

        /**
         * @ngdoc method
         * @name appverse.cache.service:SimpleIDB#init
         * @methodOf appverse.cache.service:SimpleIDB
         * @description Initialize the default Indexed DB in browser if supported
         */
        function init() {
            var deferred = $q.defer();

            if (setUp) {
                deferred.resolve(true);
                return deferred.promise;
            }

            var openRequest = window.indexedDB.open("indexeddb_appverse", 1);

            openRequest.onerror = function(e) {
                $log.debug("Error opening db");
                console.dir(e);
                deferred.reject(e.toString());
            };

            openRequest.onupgradeneeded = function(e) {

                var thisDb = e.target.result;
                var objectStore;

                //Create Note
                if (!thisDb.objectStoreNames.contains("default")) {
                    objectStore = thisDb.createObjectStore("item", {keyPath: "id", autoIncrement: true});
                    objectStore.createIndex("titlelc", "titlelc", {unique: false});
                    objectStore.createIndex("tags", "tags", {unique: false, multiEntry: true});
                }

            };

            openRequest.onsuccess = function(e) {
                db = e.target.result;

                db.onerror = function(event) {
                    // Generic error handler for all errors targeted at this database's
                    // requests!
                    deferred.reject("Database error: " + event.target.errorCode);
                };

                setUp = true;
                deferred.resolve(true);

            };

            return deferred.promise;
        }

        /**
         * @ngdoc method
         * @name appverse.cache.service:SimpleIDB#isSupported
         * @methodOf appverse.cache.service:SimpleIDB
         * @description Returns true if the browser supports the Indexed DB HTML5 spec.
         */
        service.isSupported = function() {
            return ("indexedDB" in window);
        };

        /**
         * @ngdoc method
         * @name appverse.cache.service:SimpleIDB#deleteDefault
         * @methodOf appverse.cache.service:SimpleIDB
         * @param {string} The ID of the item to be deleted.
         * @description Deletes a record with the passed ID
         */
        service.deleteDefault = function(key) {
            var deferred = $q.defer();
            var t = db.transaction(["item"], "readwrite");
            t.objectStore("item").delete(key);
            t.oncomplete = function() {
                deferred.resolve();
            };
            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name appverse.cache.service:SimpleIDB#getDefault
         * @methodOf appverse.cache.service:SimpleIDB
         * @param {string} storeName The asssigned name of the store object.
         * @description Retrieves the record with the passed ID
         * It returns a promise. remember The Indexed DB provides an asynchronous
         * non-blocking I/O access to browser storage.
         */
        service.getDefault = function(key) {
            var deferred = $q.defer();

            var transaction = db.transaction(["item"]);
            var objectStore = transaction.objectStore("item");
            var request = objectStore.get(key);

            request.onsuccess = function() {
                var note = request.result;
                deferred.resolve(note);
            };

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name appverse.cache.service:SimpleIDB#getDefaults
         * @methodOf appverse.cache.service:SimpleIDB
         * @description Retrieves the set with ALL the records in the IDB.
         * It returns a promise. remember The Indexed DB provides an asynchronous
         * non-blocking I/O access to browser storage.
         */
        service.getDefaults = function() {
            var deferred = $q.defer();

            init().then(function() {

                var result = [];

                var handleResult = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        result.push({
                            key: cursor.key, title: cursor.value.title,
                            body: cursor.value.body,
                            updated: cursor.value.updated,
                            tags: cursor.value.tags
                        });
                        cursor.continue();
                    }
                };

                var transaction = db.transaction(["item"], "readonly");
                var objectStore = transaction.objectStore("item");
                objectStore.openCursor().onsuccess = handleResult;

                transaction.oncomplete = function() {
                    deferred.resolve(result);
                };

            });
            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name appverse.cache.service:SimpleIDB#ready
         * @methodOf appverse.cache.service:SimpleIDB
         * @description This flag is true if the IDB has been successfully initializated.
         */
        service.ready = function() {
            return setUp;
        };

        /**
         * @ngdoc method
         * @name appverse.cache.service:SimpleIDB#saveDefault
         * @methodOf appverse.cache.service:SimpleIDB
         * @param {string} item The record to be stored
         * @description Saves a record with the given structure into the IDB.
         * It returns a promise. remember The Indexed DB provides an asynchronous
         * non-blocking I/O access to browser storage.
         */
        service.saveDefault = function(item) {
            //Should this call init() too? maybe
            var deferred = $q.defer();

            if (!item.id) {
                item.id = "";
            }

            var titlelc = item.title.toLowerCase();
            var t = db.transaction(["item"], "readwrite");

            if (item.id === "") {
                $log.debug('id empty');
                t.objectStore("item").add({
                    title: item.title,
                    body: item.body,
                    updated: new Date().getTime(),
                    titlelc: titlelc,
                    tags: new Array(item.tags)
                });
            } else {
                $log.debug('id not empty');
                t.objectStore("item").put({
                    title: item.title,
                    body: item.body,
                    updated: new Date(),
                    id: Number(item.id),
                    titlelc: titlelc,
                    tags: new Array(item.tags)
                });
            }

            t.oncomplete = function() {
                deferred.resolve();
            };

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name appverse.cache.service:SimpleIDB#item
         * @methodOf appverse.cache.service:item
         * @param {int} id The ID of the record to be stored
         * @param {string} title The name for record to be stored
         * @param {string} body The description of the record to be stored
         * @param {Array} tags Several tags useful for searches
         * @description This object represents the common default object stored in the IDB
         */
        service.item = function(id, title, body, tags) {
            this.id = id;
            this.title = title;
            this.body = body;
            //Array
            this.tags = tags;
        };

        return service;

    }]);

})();
