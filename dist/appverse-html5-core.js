(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.cache
     * @description
     * The Cache module includes several types of cache.
     *
     * * Scope Cache: To be used in a limited scope. It does not persist when navigation.
     *
     * * Browser Storage: It handles short strings into local or session storage. Access is synchronous.
     *
     * * IndexedDB: It initializes indexed database at browser to handle data structures. Access is asynchronous.
     *
     * * Http Cache: It initializes cache for the $httpProvider. $http service instances will use this cache.
     *
     * **WARNING - HTTP Service Cache**:
     *
     * The rest module handles its own cache. So, HttpCache affects only to manually created $http objects.
     *
     * **WARNING - IndexedDB Usage**:
     *
     * IndexedDB works both online and offline, allowing for client-side storage of large amounts of
     * structured data, in-order key retrieval, searches over the values stored, and the option to
     * store multiple values per key. With IndexedDB, all calls are asynchronous and all interactions happen within a transaction.
     * Consider Same-origin policy constraints when accessing the IDB.
     * This module creates a standard default IDB for the application domain.
     *
     * In order to make easiest as possible usage of the API two methods have been defined.
     * The below example shows how to use these object to build custom queries to the IDB
     * considering the initialization parameters:
     * <pre><code class="javascript">
       function (param){
           var queryBuilder = avCacheFactory.getIDBQueryBuilder();
           var objStore = avCacheFactory.getIDBObjectStore();
           var myQuery = queryBuilder.$index(CACHE_CONFIG.IndexedDB_mainIndex).$gt(param).$asc.compile;
           objStore.each(myQuery).then(function(cursor){
               $scope.key = cursor.key;
               $scope.value = cursor.value;
           });
       }
      </code></pre>
     *
     * @requires  appverse.configuration
     * @requires  https://github.com/jmdobry/angular-cache jmdobry.angular-cache
     */

    run.$inject = ["$log", "avCacheFactory", "CACHE_CONFIG"];
    angular.module('appverse.cache', [
        'appverse.configuration',
        'angular-cache'
    ]).run(run);

    function run($log, avCacheFactory, CACHE_CONFIG) {

        $log.info('appverse.cache run');

        if (CACHE_CONFIG.ScopeCache_Enabled) {
            avCacheFactory.setScopeCache(
                CACHE_CONFIG.ScopeCache_duration,
                CACHE_CONFIG.ScopeCache_capacity
            );
        }

        if (CACHE_CONFIG.BrowserStorageCache_Enabled) {
            avCacheFactory.setBrowserStorage(
                CACHE_CONFIG.BrowserStorage_type,
                CACHE_CONFIG.MaxAge,
                CACHE_CONFIG.CacheFlushInterval,
                CACHE_CONFIG.DeleteOnExpire,
                CACHE_CONFIG.VerifyIntegrity
            );
        }

        if (CACHE_CONFIG.HttpCache_Enabled) {
            avCacheFactory.setDefaultHttpCacheStorage(
                CACHE_CONFIG.HttpCache_duration,
                CACHE_CONFIG.HttpCache_capacity);
        }
    }

})();

(function () {
    'use strict';

    angular.module('appverse.cache')

    /**
     * @ngdoc directive
     * @name cache
     * @module  appverse.cache
     * @restrict AE
     *
     * @description
     * Use this directive to inject directly in dom nodes caching features for values.
     * Use ``` <div cache="name"></div> ``` to fill the node with the cached value of "name"
     * and updates the value in cache when the "name" model changes.
     * You can also use "cache-name" instead of "cache" to specify the model name.
     *
     * @param {string} cacheName Name of cached model
     *
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires avCacheFactory
     */
    .directive('cache', ["$log", "avCacheFactory", function ($log, avCacheFactory) {

        return {
            link: function (scope, element, attrs) {

                var name = attrs.cache || attrs.cacheName;

                scope.$watch(function () {
                    return avCacheFactory.getScopeCache().get(name);
                }, function (newVal) {
                    $log.debug('Cache watch {' + name + '}:', newVal);
                    scope[name] = avCacheFactory.getScopeCache().get(name);
                });

                scope.$watch(name, function (newVal) {
                    $log.debug('Cache watch {' + name + '}:', newVal);
                    avCacheFactory.getScopeCache().put(name, scope[name]);
                });
            }
        };
    }]);

})();

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
     * @requires http://jmdobry.github.io/angular-cache/ CacheFactory
     * @requires https://docs.angularjs.org/api/ng/service/$http $http
     * @requires CACHE_CONFIG
     */
    .factory('avCacheFactory',
        ["CacheFactory", "$http", "CACHE_CONFIG", function (CacheFactory, $http, CACHE_CONFIG) {

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
             *
             * @returns {object} scope cache object.
             */
            factory.getScopeCache = function () {
                return factory._scopeCache || factory.setScopeCache(CACHE_CONFIG.ScopeCache_duration,
                    CACHE_CONFIG.ScopeCache_capacity);
            };

            /**
             * @ngdoc method
             * @name avCacheFactory#setBrowserStorage
             *
             * @param {string} type Type of storage ( '1' localStorage | '2' sessionStorage).
             * @param {number} maxAgeInit
             * @param {number} cacheFlushIntervalInit
             * @param {number} deleteOnExpireInit
             *
             * @description This object makes Web Storage working in the Angular Way.
             * By default, web storage allows you 5-10MB of space to work with, and your data is stored locally
             * on the device rather than passed back-and-forth with each request to the server.
             * Web storage is useful for storing small amounts of key/value data and preserving functionality
             * online and offline.
             * With web storage, both the keys and values are stored as strings.
             *
             * We can store anything except those not supported by JSON:
             * Infinity, NaN - Will be replaced with null.
             * undefined, Function - Will be removed.
             * The returned object supports the following set of methods:
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
             * @param {number} capacity  turns the cache into LRU (Least Recently Used) cache.
             * @description Default cache configuration for $http service.
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
             * @description Returns the httpcache object in factory
             * @returns {object} http cache object.
             */
            factory.getHttpCache = function () {
                return factory._httpCache;
            };

            return factory;
        }]

    );
})();

(function () {
    'use strict';

    angular.module('appverse.cache')

    /**
     * @ngdoc service
     * @name IDBService
     * @module  appverse.cache
     *
     * @description
     * This service has been planned to be used as a simple HTML5's indexedDB specification with the appverse.
     * A pre-configured data structure has been included to be used for common purposes:
     * * Data Structure Name: 'default'
     * * Fields: Id, Title, Body, Tags, Updated.
     * * Indexes: Id (Unique), titlelc(Unique), tag(multientry).
     *
     * @requires https://docs.angularjs.org/api/ng/service/$q $q
     * @requires https://docs.angularjs.org/api/ngMock/service/$log $log
     */
    .service('IDBService', ["$q", "$log", function ($q, $log) {
        var setUp = false;
        var db;

        var service = {};

        /**
         * @ngdoc method
         * @name IDBService#init
         * @description Initialize the default Indexed DB in browser if supported
         */
        function init() {
            var deferred = $q.defer();

            if (setUp) {
                deferred.resolve(true);
                return deferred.promise;
            }

            var openRequest = window.indexedDB.open("indexeddb_appverse", 1);

            openRequest.onerror = function (e) {
                $log.debug("Error opening db");
                deferred.reject(e.toString());
            };

            openRequest.onupgradeneeded = function (e) {

                var thisDb = e.target.result;
                var objectStore;

                //Create Note
                if (!thisDb.objectStoreNames.contains("default")) {
                    objectStore = thisDb.createObjectStore("item", {
                        keyPath: "id",
                        autoIncrement: true
                    });
                    objectStore.createIndex("titlelc", "titlelc", {
                        unique: false
                    });
                    objectStore.createIndex("tags", "tags", {
                        unique: false,
                        multiEntry: true
                    });
                }

            };

            openRequest.onsuccess = function (e) {
                db = e.target.result;

                db.onerror = function (event) {
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
         * @name IDBService#isSupported
         * @description Returns true if the browser supports the Indexed DB HTML5 spec.
         */
        service.isSupported = function () {
            return ("indexedDB" in window);
        };

        /**
         * @ngdoc method
         * @name IDBService#deleteDefault
         * @param {string} The ID of the item to be deleted.
         * @description Deletes a record with the passed ID
         */
        service.deleteDefault = function (key) {
            var deferred = $q.defer();
            var t = db.transaction(["item"], "readwrite");
            t.objectStore("item").delete(key);
            t.oncomplete = function () {
                deferred.resolve();
            };
            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name IDBService#getDefault
         * @param {string} storeName The asssigned name of the store object.
         * @description Retrieves the record with the passed ID
         * It returns a promise. remember The Indexed DB provides an asynchronous
         * non-blocking I/O access to browser storage.
         */
        service.getDefault = function (key) {
            var deferred = $q.defer();

            var transaction = db.transaction(["item"]);
            var objectStore = transaction.objectStore("item");
            var request = objectStore.get(key);

            request.onsuccess = function () {
                var note = request.result;
                deferred.resolve(note);
            };

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name IDBService#getDefaults
         * @description Retrieves the set with ALL the records in the IDB.
         * It returns a promise. remember The Indexed DB provides an asynchronous
         * non-blocking I/O access to browser storage.
         */
        service.getDefaults = function () {
            var deferred = $q.defer();

            init().then(function () {

                var result = [];

                var handleResult = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        result.push({
                            key: cursor.key,
                            title: cursor.value.title,
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

                transaction.oncomplete = function () {
                    deferred.resolve(result);
                };

            });
            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name IDBService#ready
         * @description This flag is true if the IDB has been successfully initializated.
         */
        service.ready = function () {
            return setUp;
        };

        /**
         * @ngdoc method
         * @name IDBService#saveDefault
         * @param {string} item The record to be stored
         * @description Saves a record with the given structure into the IDB.
         * It returns a promise. remember The Indexed DB provides an asynchronous
         * non-blocking I/O access to browser storage.
         */
        service.saveDefault = function (item) {
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

            t.oncomplete = function () {
                deferred.resolve();
            };

            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name IDBService#item
         *
         * @param {int} id The ID of the record to be stored
         * @param {string} title The name for record to be stored
         * @param {string} body The description of the record to be stored
         * @param {Array} tags Several tags useful for searches
         * @description This object represents the common default object stored in the IDB
         */
        service.item = function (id, title, body, tags) {
            this.id = id;
            this.title = title;
            this.body = body;
            //Array
            this.tags = tags;
        };

        return service;
    }]);

})();

(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.detection
     *
     * @description
     * Provides browser and network detection.
     */
    angular.module('appverse.detection', [
        'appverse.utils',
        'appverse.detection.mobile',
        'appverse.detection.provider'
    ]);

})();

(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.detection.provider
     *
     * @description
     * Defines the Detection provider.
     */
    DetectionProvider.$inject = ["MobileDetectorProvider"];
    angular.module('appverse.detection.provider', ['appverse.detection.mobile'])

    /**
     * @ngdoc provider
     * @name Detection
     * @module appverse.detection.provider
     *
     * @description
     * Contains methods for browser and network detection.
     */
    .provider('Detection', DetectionProvider);

    function DetectionProvider(MobileDetectorProvider) {

        this.mobileDetector = MobileDetectorProvider;
        this.bandwidth = 0;
        this.isPollingBandwidth = false;
        // Injected when the detection service is created
        this.$http = undefined;

        // Get the service
        this.$get = ["$http", function($http) {
            this.$http = $http;
            return this;
        }];

        /**
         * @ngdoc method
         * @name  Detection#hasAppverseMobile
         * @return {Boolean} Whether the application has Appverse mobile or not
         */
        this.hasAppverseMobile = function() {
            return this.mobileDetector.hasAppverseMobile();
        };

        /**
         * @ngdoc method
         * @name  Detection#isMobileBrowser
         * @return {Boolean} Whether the application is running on a mobile browser
         */
        this.isMobileBrowser = function() {
            return this.mobileDetector.isMobileBrowser();
        };

        // Do some initialization
        if (this.hasAppverseMobile() || this.isMobileBrowser()) {
            // Do something for mobile...
        }

        var fireEvent = function(name, data) {
            var e = document.createEvent("Event");
            e.initEvent(name, true, true);
            e.data = data;
            window.dispatchEvent(e);
        };

        var fetch = function(url, callback) {
            var xhr = new XMLHttpRequest();

            var noResponseTimer = setTimeout(function() {
                xhr.abort();
                fireEvent("connectiontimeout", {});
            }, 5000);

            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) {
                    return;
                }

                if (xhr.status === 200) {
                    fireEvent("goodconnection", {});
                    clearTimeout(noResponseTimer);
                    if (callback) {
                        callback(xhr.responseText);
                    }
                } else {
                    fireEvent("connectionerror", {});
                }
            };
            xhr.open("GET", url);
            xhr.send();
        };

        this.isOnline = window.navigator.onLine;
        this.isPollingOnlineStatus = false;

        /**
         * @ngdoc method
         * @name Detection#testOnlineStatus
         *
         * @param {String} path The item URL
         * @description Tries to fetch a file on the server and fire events for fail and success.
         */
        this.testOnlineStatus = function() {
            fetch("resources/detection/ping.json");
        };

        /**
         * @ngdoc method
         * @name Detection#startPollingOnlineStatus
         *
         * @param {number} interval Time in milliseconds
         * @description Tries to fetch a file on the server at regular intervals and fire events for fail and success.
         */
        this.startPollingOnlineStatus = function(interval) {
            this.isPollingOnlineStatus = setInterval(this.testOnlineStatus, interval);
        };

        /**
         * @ngdoc method
         * @name Detection#stopPollingOnlineStatus
         *
         * @description Stops fetching the file from the server.
         */
        this.stopPollingOnlineStatus = function() {
            clearInterval(this.isPollingOnlineStatus);
            this.isPollingOnlineStatus = false;
        };

        /**
         * @ngdoc method
         * @name Detection#testBandwidth
         */
        this.testBandwidth = function() {
            var jsonUrl = "resources/detection/bandwidth.json?bust=" + (new Date()).getTime();
            fireEvent("onBandwidthStart");
            this.$http.get(jsonUrl).success(function(data, status, headersFn) {
                fireEvent("onBandwidthEnd", {
                    status: status,
                    data: data,
                    getResponseHeader: headersFn
                });
            });
        };

        /**
         * @ngdoc method
         * @name Detection#startPollingBandwidth
         *
         * @param {number} interval Time in milliseconds
         */
        this.startPollingBandwidth = function(interval) {
            this.testBandwidth();
            this.isPollingBandwidth = setInterval(this.testBandwidth.bind(this), interval);
        };

        /**
         * @ngdoc method
         * @name Detection#stopPollingBandwidth
         *
         * @param {number} interval Time in milliseconds
         */
        this.stopPollingBandwidth = function() {
            clearInterval(this.isPollingBandwidth);
            this.isPollingBandwidth = false;
        };
    }


})();

(function() {
    'use strict';

    angular.module('appverse.detection.mobile',[])
        .provider('MobileDetector', MobileDetectorProvider);

    /**
     * @ngdoc provider
     * @name MobileDetector
     * @module appverse.detection
     *
     * @description
     * Detects if the browser is mobile
     */
    function MobileDetectorProvider() {

        this.$get = function() {
            return this;
        };

        /**
         * @ngdoc method
         * @name MobileDetector#hasAppverseMobile
         * @return {Boolean}
         */
        this.hasAppverseMobile = function() {
            if (typeof(_AppverseContext) !== "undefined") {
                return true;
            } else if (window.localStorage.getItem("_AppverseContext")) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * @ngdoc method
         * @name MobileDetector#isMobileBrowser
         * @return {Boolean}
         */
        this.isMobileBrowser = function(customAgent) {
            var agent = customAgent || navigator.userAgent || navigator.vendor || window.opera;
            return agentContainsMobileKeyword(agent);
        };

        function agentContainsMobileKeyword(agent) {

            /*jshint ignore:start,-W101*/
            // Code adapted from http://detectmobilebrowser.com
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4));
            /*jshint ignore:end,-W101*/
        }
    }

})();

(function () {
    'use strict';

    run.$inject = ["$log", "Detection", "$rootScope", "$window"];
    angular.module('appverse.detection')
        .run(run);

    function run($log, Detection, $rootScope, $window) {
        $log.info('appverse.detection run');

        if ($window.addEventListener) {
            $window.addEventListener("online", function () {
                $log.debug('detectionController online');
                Detection.isOnline = true;
                $rootScope.$digest();
            }, true);

            $window.addEventListener("offline", function () {
                $log.debug('detectionController offline');
                Detection.isOnline = false;
                $rootScope.$digest();
            }, true);
        } else {
            $log.warn('Detection module: $window.addEventListener not supported.');
        }

        if ($window.applicationCache) {
            $window.applicationCache.addEventListener("error", function () {
                $log.debug("Error fetching manifest: a good chance we are offline");
            });
        } else {
            $log.warn('Detection module: $window.applicationCache not supported.');
        }

        if (window.addEventListener) {
            window.addEventListener("goodconnection", function () {
                $log.debug('detectionController goodconnection');
                Detection.isOnline = true;
                $rootScope.$digest();
            });

            window.addEventListener("connectiontimeout", function () {
                $log.debug('detectionController connectiontimeout');
                Detection.isOnline = false;
                $rootScope.$digest();
            });

            window.addEventListener("connectionerror", function () {
                $log.debug('detectionController connectionerror');
                Detection.isOnline = false;
                $rootScope.$digest();
            });

            window.addEventListener("onBandwidthStart", function () {
                $log.debug('detectionController onBandwidthStart');
                Detection.bandwidthStartTime = new Date();
            });

            window.addEventListener("onBandwidthEnd", function (e) {
                $log.debug('detectionController onBandwidthEnd');
                var contentLength = parseInt(e.data.getResponseHeader('Content-Length'), 10);
                var delay = new Date() - Detection.bandwidthStartTime;
                Detection.bandwidth = parseInt((contentLength / 1024) / (delay / 1000));
                setTimeout(function () {
                    $rootScope.$digest();
                });
            });
        } else {
            $log.warn('Detection module: window.addEventListener not supported.');
        }

        if (!$window.Appverse) {
            $window.Appverse = {
                is: {}
            };
            Appverse.is.iOS = Appverse.is.iPhone = Appverse.is.iPod = Appverse.is.iPad = Appverse.is.Android = Appverse.is.Mac = Appverse.is.Windows = Appverse.is.Linux = Appverse.is.Blackberry = Appverse.is.Tablet = Appverse.is.WindowsPhone = false;
            if (navigator.userAgent.match(/iPhone/i)) {
                Appverse.is.iPhone = true;
            }
            if (navigator.userAgent.match(/iPod/i)) {
                Appverse.is.iPod = true;
            }
            if (navigator.userAgent.match(/iPad/i)) {
                Appverse.is.iPad = true;
            }
            if (navigator.userAgent.indexOf("android") > -1) {
                Appverse.is.Android = true;
            }
            if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
                Appverse.is.Mac = true;
            }
            if (navigator.appVersion.indexOf("Win") !== -1) {
                Appverse.is.Windows = true;
            }
            if (navigator.appVersion.indexOf("Linux") !== -1) {
                Appverse.is.Linux = true;
            }
            if (navigator.userAgent.toLowerCase().indexOf("blackberry") >= 0) {
                Appverse.is.Blackberry = true;
            }
            if ((/ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase()))) {
                Appverse.is.Tablet = true;
            }
            if (navigator.userAgent.match(/Windows Phone/i) || navigator.userAgent.match(/iemobile/i)) {
                Appverse.is.WindowsPhone = true;
            }
            Appverse.is.Desktop = Appverse.is.Windows || Appverse.is.Linux || Appverse.is.Mac;
            Appverse.is.Phone = !Appverse.is.Desktop && !Appverse.is.Tablet;
        }
    }

})();

(function () {
    'use strict';

    var requires = [
        'ionic',
        'appverse.detection',
        'ui.router',
        'appverse.ionic.templates'
    ];


    /**
     * @ngdoc module
     * @name appverse.ionic
     *
     * @description
     * Provides ionic management views
     *
     * @requires appverse.detection
     * @requires ui.router
     * @requires ui.bootstrap
     */

    angular.module('appverse.ionic', requires);
})();

(function() {
    'use strict';

    angular.module('appverse.ionic')

    .controller('ModalNotAllowedCntrl',
        ["$scope", "$uibModalInstance", "Detection", "$location", "$timeout", "IONIC_CONFIG", function($scope, $uibModalInstance, Detection, $location, $timeout, IONIC_CONFIG) {
            if (Detection.isMobileBrowser()) {
                $scope.device = 'device';
            } else {
                $scope.device = 'desktop';
            }

            $scope.seconds = 5;
            var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

            function timer() {
                $scope.seconds = $scope.seconds - 1;
                $scope.$evalAsync($scope.seconds);
                if ($scope.seconds <= 0) {
                    clearInterval(counter);
                    $uibModalInstance.close();
                    $timeout(function() {
                        $location.path(IONIC_CONFIG.redirectionPath);
                    }, 300);
                    return;
                }
            }
        }]);
})();

(function () {
    'use strict';

    run.$inject = ["$log", "Detection", "$rootScope", "$state", "IONIC_CONFIG", "$location"];
    angular.module('appverse.ionic')
        .run(run);

    function run($log, Detection, $rootScope, $state, IONIC_CONFIG, $location) {
        $log.info('appverse.ionic run');
        var state = $state;

        function showModalPrompt() {
            if (IONIC_CONFIG.modalPrompt) {

                angular.injector(['ui.bootstrap']).get('$uibModal').open({
                    templateUrl: 'appverse-ionic/modal/not-allowed.html',
                    controller: 'ModalNotAllowedCntrl'
                });
            } else {
                $location.path(IONIC_CONFIG.redirectionPath);
            }

        }

        function transformState(toState) {
            //check if a mobile view exists, if is available in our envirnoment and if needs a different controller
            if (toState.data.mobile && Detection.isMobileBrowser()) {
                if (!toState.data.restrict) {
                    var parentState = state.get('^', toState);
                    if (parentState && parentState.mobile && !parentState.restrict) {
                      parentState.templateUrl = parentState.templateUrl.split('.html')[0] + IONIC_CONFIG.suffix + '.html';
                    }
                    toState.templateUrl = toState.templateUrl.split('.html')[0] + IONIC_CONFIG.suffix + '.html';
                }
                if (toState.data.controller) {
                    toState.controller = toState.data.controller;
                }
            }

            //After change (if is necessary) the template and controller, delete data object to avoid all the process the next time
            delete toState.data;
        }

        $rootScope.$on('$stateChangeStart', function (event, toState) {

            if (toState.data) {
                //if toState.data exists, check restrict attribute
                if (toState.data.restrict) {
                    //if restrict, check environment
                    if ((!Detection.isMobileBrowser() && toState.data.mobile) || (Detection.isMobileBrowser() && !toState.data.mobile)) {
                        showModalPrompt();
                    } else {
                        transformState(toState);
                    }
                } else {
                    //if NOT restrict, check environment
                    transformState(toState);
                }
            }
        });

    }
})();

/*jshint -W101 */
angular.module('appverse.ionic.templates', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('appverse-ionic/modal/not-allowed.html',
    '<div class="modal-header"><h3 class="modal-title">Not Allowed</h3></div><div class="modal-body">This view is not allowed in {{device}} version, you will be redirected to home page in {{seconds}}...</div>');
}]);

(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.logging
     *
     * @description
     * The Logging module handles several tasks with logging:
     *
     * 1. It applies a decorator on native $log service in module ng.
     *
     * 2. It includes sending of log events to server-side REST service.
     *
     * ## Warning
     *
     * IT IS STRONGLY RECOMMENDED TO USE THIS LOG IMPLEMENTATION AND NEVER directly
     * to use console.log() to log debugger messages.
     * If you do not use this one, use $log instead at least...
     *
     * ## Server side log
     *
     * To handle JavaScript errors, we needed to intercept the core AngularJS
     * error handling and add a server-side communication aspect to it.
     *
     * ## Decorator way
     *
     * The $provide service (which provides all angular services) needs 2 parameters to “decorate” something:
     *
     * 1) the target service;
     *
     * 2) the callback to be executed every time someone asks for the target.
     *
     * This way, we are telling in config time to Angular that every time
     * a service/controller/directive asks for $log instance,
     * Angular will provide the result of the callback.
     * As you can see, we are passing the original $log
     * and formattedLogger (the API implementation) to the callback,
     * and then, he returns a formattedLogger factory instance.
     *
     * @requires  appverse.configuration
     */
    angular.module('appverse.logging', ['appverse.configuration'])
        .config(["$provide",  function ($provide) {
            $provide.decorator("$log", ['$delegate', 'FormattedLogger',
                function ($delegate, FormattedLogger) {
                    return FormattedLogger($delegate);
                }]);
        }]);

})();
(function() {
    'use strict';

    angular.module('appverse.logging')

    /**
     * @ngdoc provider
     * @name FormattedLogger
     * @module appverse.logging
     *
     * @description
     * Captures the $log service and decorate it.
     */
    .provider("FormattedLogger", FormattedLoggerProvider);

    function FormattedLoggerProvider() {

        var detectionProvider;

        this.$get = ["$injector", "LOGGING_CONFIG", function($injector, LOGGING_CONFIG) {
            return function decorateLog(delegatedLog) {

                /**
                 * @function DateTime
                 * @param date The date to be formatted
                 * @param format The format of the returned date
                 *
                 * @description
                 * It formats a date
                 */
                function dateTime(date, format) {

                    date = date || new Date();
                    format = format || LOGGING_CONFIG.LogDateTimeFormat;

                    function pad(value) {
                        return (value.toString().length < 2) ? '0' + value : value;
                    }

                    return format.replace(/%([a-zA-Z])/g, function(_, fmtCode) {
                        switch (fmtCode) {
                            case 'Y':
                                return date.getFullYear();
                            case 'M':
                                return pad(date.getMonth() + 1);
                            case 'd':
                                return pad(date.getDate());
                            case 'h':
                                return pad(date.getHours());
                            case 'm':
                                return pad(date.getMinutes());
                            case 's':
                                return pad(date.getSeconds());
                            case 'z':
                                return pad(date.getMilliseconds());
                            default:
                                throw new Error('Unsupported format code: ' + fmtCode);
                        }
                    });
                }

                /**
                 * @function handleLogMessage
                 * @param enable Is enabled in configuration
                 * @param logLevel Configures maximumm log level
                 * @param logFunction Explicit method from delegatedLog
                 *
                 * @description
                 * It arranges the log message and send it to the server registry.
                 */
                function handleLogMessage(enable, logLevel, logFunction) {
                    try {

                        if (!enable) {
                            return function() {};
                        }

                        var logMessage = logLevel + " | " + LOGGING_CONFIG.CustomLogPreffix + " | ";

                        var f = function() {
                            var args = Array.prototype.slice.call(arguments);

                            if (Object.prototype.toString.call(args[0]) === '[object String]') {
                                args[0] = logMessage + dateTime() + " | " + args[0];
                            } else {
                                args.push(args[0]);
                                args[0] = logMessage + dateTime() + " | ";
                            }

                            logFunction.apply(null, args);

                            if (LOGGING_CONFIG.ServerEnabled) {
                                var logData = {
                                    logUrl: window.location.href,
                                    logMessage: args[0]
                                };

                                if (args.length === 2) {
                                    logData.logMessage += ' ' + JSON.stringify(args[1]);
                                }

                                if (browserIsOnline()) {
                                    var $http = $injector.get('$http');
                                    $http.post(LOGGING_CONFIG.LogServerEndpoint, logData);
                                }
                            }
                        };

                        // Only needed to support angular-mocks expectations
                        f.logs = [];

                        return f;

                    } catch (loggingError) {
                        // ONLY FOR DEVELOPERS - log the log-failure.
                        throw loggingError;
                    }
                }

                /*
                Our calls depend on the $log service methods (http://docs.angularjs.org/api/ng.$log)

                debug() Write a debug message
                error() Write an error message
                info() Write an information message
                log() Write a log message
                warn() Write a warning message
                 */
                delegatedLog.log = handleLogMessage(LOGGING_CONFIG.EnabledLogLevel, 'LOG  ', delegatedLog.log);
                delegatedLog.info = handleLogMessage(LOGGING_CONFIG.EnabledInfoLevel, 'INFO ', delegatedLog.info);
                delegatedLog.error = handleLogMessage(LOGGING_CONFIG.EnabledErrorLevel, 'ERROR', delegatedLog.error);
                delegatedLog.warn = handleLogMessage(LOGGING_CONFIG.EnabledWarnLevel, 'WARN ', delegatedLog.warn);
                delegatedLog.debug = handleLogMessage(LOGGING_CONFIG.EnabledDebugLevel, 'DEBUG', delegatedLog.debug);

                return delegatedLog;
            };
        }];


        this.setDetection = function(detection) {
            detectionProvider = detection;
        };

        function browserIsOnline() {
            if (detectionProvider) {
                return detectionProvider.isOnline;
            } else {
                // if no detection service provided, return true
                return true;
            }
        }
    }


})();

/*globals AppverseEmulator, get_params:false, unescape:false */
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.native
     *
     * @description
     * Provides native utilities using Appverse mobile
     *
     * @requires appverse.detection
     */
    angular.module('appverse.native', ['appverse.detection', 'appverse.cache'])

    .config(
        ["$httpProvider", "DetectionProvider", "REST_CONFIG", function ($httpProvider, DetectionProvider, REST_CONFIG) {

            window.$httpCounter = 0;

            var setIoService = function (config) {
                var ioService = {};
                ioService.Endpoint = {};
                ioService.Endpoint.Path = config.url.split(REST_CONFIG.BaseUrl)[1];

                if (!REST_CONFIG.HostList[config.ind]) {
                    console.error("Host not found in Host list: ", REST_CONFIG.HostList);
                } else {
                    ioService.Endpoint.Host = REST_CONFIG.HostList[config.ind].Host;
                    ioService.Endpoint.Port = REST_CONFIG.HostList[config.ind].Port;
                }

                if (REST_CONFIG.ServerMode === 'MockServer') {
                    ioService.Endpoint.ProxyUrl = REST_CONFIG.MockServer.URL + ':' + REST_CONFIG.MockServer.Port;
                } else {
                    ioService.Endpoint.ProxyUrl = "";
                }

                return ioService;
            };

            var setRequestObject = function (config) {
                var request = {};
                request.Headers = [];

                //Pending Appverse Mobile format
                //            angular.forEach(config.headers, function(value, header) {
                //                request.Headers.push({
                //                    Name: header,
                //                    Value: value
                //                })
                //            });

                request.Content = config.data;
                request.ContentType = "application/json";
                request.Session = {};
                request.Method = config.method;
                request.StopAutoRedirect = false;

                return request;
            };

            $httpProvider.interceptors.push(["$q", "$log", function ($q, $log) {
                return {
                    request: function (config) {

                        if (config.url.indexOf(REST_CONFIG.BaseUrl) !== 0 || !DetectionProvider.hasAppverseMobile()) {
                            $log.debug('request fallthrough', config);
                            return config;
                        }

                        if (config.cache && config.method === 'GET' && $httpProvider.defaults.cache && $httpProvider.defaults.cache.get(config.url)) {
                            $log.debug('request cached', config);
                            return config;
                        }

                        $log.debug('request override', config);

                        window.$httpCounter++;
                        window['$httpPromise' + window.$httpCounter] = $q.defer();
                        window['$httpConfig' + window.$httpCounter] = angular.copy(config);

                        var methodName = "InvokeService";
                        var callBackFuncName = "$httpCallback";
                        var callbackId = window.$httpCounter;

                        if (!config.ind) {
                            config.ind = 0;
                        }

                        var params = get_params([setRequestObject(config), setIoService(config)]);

                        var legacyPath = Appverse.SERVICE_URI + Appverse.IO.serviceName + "/" + methodName;
                        var newPath = Appverse.APPVERSE_SERVICE_URI + Appverse.IO.serviceName + "/" + methodName; // new path for Appverse 5.0 (applied when possible)

                        var path = legacyPath; // by default, use legacy path

                        if (Appverse.is.iOS) {
                            path = newPath; // we use the new path for all iOS devices
                        }

                        var reqData = "";

                        if (callBackFuncName !== null) {
                            reqData = reqData + "callback=" + callBackFuncName;
                        } else {
                            reqData = reqData + "callback=NULL";
                        }
                        if (callbackId !== null) {
                            reqData = reqData + "&callbackid=" + callbackId;
                        } else {
                            reqData = reqData + "&callbackid=callbackid";
                            callbackId = "callbackId";
                        }

                        if (params !== null) {
                            //reqData = reqData + "&json=" + unescape(params);
                            if (Appverse.unescapeNextRequestData) {
                                reqData = reqData + "&json=" + unescape(params);
                            } else {
                                reqData = reqData + "&json=" + params; // we don't unscape parameters if configured
                                Appverse.unescapeNextRequestData = true; // returning to default configuration value
                            }
                        }

                        if (window.webkit) {
                            // using new WKWebView message handlers, if available (iOS 8)
                            window.webkit.messageHandlers.service.postMessage({
                                uri: path,
                                query: reqData
                            });
                            return;
                        }

                        if (window.appverseJSBridge) { // only available for 4.2+ Android devices
                            path = newPath;
                            window.appverseJSBridge.postMessage(path, reqData);
                            return;
                        }

                        if (window.external && window.external.notify) { // using external post notifications for Windows Phone
                            var t = {
                                uri: newPath,
                                query: reqData
                            };
                            window.external.notify(JSON.stringify(t));
                            return;
                        }

                        if (AppverseEmulator.eventListenersRegistered && AppverseEmulator.eventListenersRegistered.indexOf(methodName) >= 0) {
                            AppverseEmulator.queuedListenerMessagesCount++;
                            console.log("Appverse Emulator - queue listener result for methodName: " + AppverseEmulator.normalizeListenerCallingName(methodName));

                            (function (smn) {
                                setTimeout(function () {
                                    AppverseEmulator.appverseListenerPollingTimerFunc(smn);
                                }, AppverseEmulator.pollingInterval);
                            })(Appverse.IO.serviceName + "#" + AppverseEmulator.normalizeListenerCallingName(methodName));
                        }

                        if (Appverse.executingInEmulator) {
                            if (callBackFuncName !== null) {
                                AppverseEmulator.queuedCallbackMessagesCount++;
                                console.log("Appverse Emulator - queue callback result for methodName: " + methodName);
                                (function (c, ci) {
                                    setTimeout(function () {
                                        AppverseEmulator.appverseCallbackPollingTimerFunc(c, ci);
                                    }, AppverseEmulator.pollingInterval);
                                })(callBackFuncName, callbackId);
                            }
                        }

                        delete config.headers.Accept;
                        config.headers['Content-Type'] = 'application/json;charset=UTF-8';
                        config.method = 'POST';
                        config.url = path;
                        config.data = reqData;

                        return config;
                    },
                    response: function (response) {

                        if (!response.config.url || response.config.url.indexOf(Appverse.SERVICE_URI + Appverse.IO.serviceName + "/InvokeService") !== 0) {
                            return response;
                        }

                        $log.debug('response override', response);

                        var counter = response.config.data.split('callbackid=')[1].split('&')[0];
                        return window['$httpPromise' + counter].promise;
                    }
                };
            }]);

        }])

    .run(["$http", "$log", function ($http, $log) {

        function createMap() {
            return Object.create(null);
        }

        var trim = function (value) {
            return angular.isString(value) ? value.trim() : value;
        };

        function parseHeaders(headers) {
            var parsed = createMap(),
                key, val, i;

            if (!headers) {
                return parsed;
            }

            angular.forEach(headers.split('\n'), function (line) {
                i = line.indexOf(':');
                key = angular.lowercase(trim(line.substr(0, i)));
                val = trim(line.substr(i + 1));

                if (key) {
                    parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
                }
            });

            return parsed;
        }

        function headersGetter(headers) {
            var headersObj = angular.isObject(headers) ? headers : undefined;

            return function (name) {
                if (!headersObj) {
                    headersObj = parseHeaders(headers);
                }

                if (name) {
                    var value = headersObj[angular.lowercase(name)];
                    if (value === void 0) {
                        value = null;
                    }
                    return value;
                }

                return headersObj;
            };
        }

        window.$httpCallback = function (result, id) {

            $log.debug('$httpCallback id', id);
            $log.debug('$httpCallback result', result);

            var response = {};
            response.config = window['$httpConfig' + id];

            if (result !== null) {
                var headers = '';
                angular.forEach(result.Headers, function (header) {
                    headers += header.Name + ':' + header.Value + '\n';
                });

                response.headers = headersGetter(headers);

                if (result.Content.length > 0) {
                    response.data = JSON.parse(result.Content);
                }
                response.status = 200;
                response.statusText = "OK";

                if (response.config.cache && $http.defaults.cache && response.config.method === 'GET') {
                    $http.defaults.cache.put(response.config.url, [response.status, response.data, response.headers(), response.statusText]);
                }

                window['$httpPromise' + id].resolve(response);
            } else {
                response.status = 404;
                response.statusText = "Error";

                window['$httpPromise' + id].reject(response);
            }

            delete window['$httpConfig' + id];
            delete window['$httpPromise' + id];
        };

    }]);

})();
(function () {
    'use strict';

    angular.module('appverse.native')

    /**
     * @ngdoc service
     * @name AppverseNative
     * @module appverse.native
     * @description This module provides basic quick standard access to a Native functions
     */
    .run(["$log", "$q", "Detection", "$window", "$timeout", "$interval", function ($log, $q, Detection, $window, $timeout, $interval) {


        if (!Detection.hasAppverseMobile()) {
            return;
        }

        var deferredGeo;

        $window.callbackGeo = function (result) {
            if (result) {
                Appverse.Geo.StartUpdatingLocation('callbackGeoStart');
            } else {
                deferredGeo.reject();
            }
        };

        $window.callbackGeoStart = function (result) {
            if (result) {
                Appverse.Geo.GetCoordinates('callbackGeoCoordinates');
            } else {
                deferredGeo.reject();
            }
        };

        $window.callbackGeoCoordinates = function (coordinates) {
            if (coordinates) {
                deferredGeo.resolve(coordinates);
            } else {
                deferredGeo.reject();
            }
        };

        $window.onAccessToLocationDenied = function () {
            var PositionError = {
                code: 1,
                message: 'Permission denied.'
            };
            deferredGeo.reject(PositionError);
        };

        var updatePosition = function (success, error, PositionOptions) {
            deferredGeo = $q.defer();

            deferredGeo.promise.then(function (data) {
                var Position = {};
                Position.coords = {
                    latitude: data.XCoordinate,
                    longitude: data.YCoordinate,
                    altitude: data.ZCoordinate,
                    accuracy: (data.XDoP + data.YDoP) / 2,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                };
                Position.timestamp = new Date().getTime();
                success(Position);
                Appverse.Geo.StopUpdatingLocation();
            }).catch(function (PositionError) {
                if (!PositionError) {
                    PositionError = {
                        code: 2,
                        message: 'Postion unavailable.'
                    };
                }
                error(PositionError);
            });

            Appverse.Geo.IsGPSEnabled('callbackGeo');

            if (PositionOptions && PositionOptions.timeout) {
                $timeout(function () {
                    var PositionError = {
                        code: 3,
                        message: 'Request timed out.'
                    };
                    deferredGeo.reject(PositionError);
                }, PositionOptions.timeout);
            } else {
                PositionOptions = {
                    enableHighAccuracy: false,
                    timeout: window.Infinity,
                    maximumAge: 0
                };
            }
        };

        if ($window.navigator && $window.navigator.geolocation) {
            $window.navigator.geolocation.getCurrentPosition = function (success, error, PositionOptions) {

                updatePosition(success, error, PositionOptions);
            };

            $window.navigator.geolocation.watchPosition = function (success, error, PositionOptions) {

                var watchId = $interval(function () {
                    updatePosition(success, error, PositionOptions);
                }, 1000);
                return watchId;
            };

            $window.navigator.geolocation.clearWatch = function (watchId) {
                $interval.cancel(watchId);
                Appverse.Geo.StopUpdatingLocation();
            };
        }

        var deferredNetwork;

        var updateOnlineStatus = function () {
            deferredNetwork = $q.defer();

            deferredNetwork.promise.then(function () {
                Detection.isOnline = true;
            }).catch(function () {
                Detection.isOnline = false;
            });

            $window.callbackNetwork = function (result) {
                if (result) {
                    deferredNetwork.resolve();
                } else {
                    deferredNetwork.reject();
                }
            };
            Appverse.Net.IsNetworkReachable('www.google.com', 'callbackNetwork');
        };

        updateOnlineStatus();

        $window.onConnectivityChange = function () {
            updateOnlineStatus();
        };
    }]);
})();
(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.performance
     *
     * @description
     * The AppPerformance provides services to handle usage of several performance elements:
     * 1. Webworkers. Multithreaded-parallelized execution of tasks separated of the main JavaScript thread.
     * 2. High Performance UI directives support.
     *
     * @requires appverse.configuration
     */
    run.$inject = ["$log"];
    angular.module('appverse.performance', ['appverse.configuration'])
        .run(run);

    function run ($log) {
        $log.info('appverse.performance run');
    }

})();
(function () {
    'use strict';

    angular.module('appverse.performance')


    /**
    * @ngdoc directive
    * @name webworker
    * @module appverse.performance
    * @restrict E
    *
    * @description
    * Establishes comm with messages to a selected web worker.
    * Allows send messages to the worker and receive results from.
    * Messages from the worker are displayed in a div.
    *
    * @example
    <example module="appverse.performance">
    <file name="index.html">
    <p>Web Worker test</p>
    <webworker  id="101" message="Hans Walter" template=""/>
    </file>
    </example>
    *
    * @param {string} id Id of the pre-configured worker or path to the worker's file
    * @param {string} message Message to be passed to the worker.
    *
    * @requires  https://docs.angularjs.org/api/ngMock/service/$log $log
    * @requires  WebWorkerFactory
    * @requires  PERFORMANCE_CONFIG
    */
    .directive('webworker', ['$log', 'WebWorkerFactory', 'PERFORMANCE_CONFIG',
        function ($log, WebWorkerFactory, PERFORMANCE_CONFIG) {

            return {
                restrict: 'E', //E = element, A = attribute, C = class, M = comment
                scope: {
                    //(required) set the worker id in configuration or the complete path
                    //if it is not included in config.
                    workerid: '@',
                    //(required) set the message to be passed to the worker
                    message: '@',
                    //(optional) custom template to render the received message from the worker
                    template: '@'
                },
                priority: 1000,
                terminal: true,
                compile: function () {},
                link: function postLink(scope, element, attrs) {
                    var workerid = attrs.id;
                    var template = attrs.template;

                    scope.$watch(function () {
                        return WebWorkerFactory._resultMessage;
                    }, function (newVal) {
                        $log.debug('Cache watch {' + name + '}:', newVal);
                        scope.messageFromWorker = WebWorkerFactory._resultMessage;
                    });

                    scope.$watch('message', function (value) {
                        init(value); // set defaults
                        compileTemplate(); // gets the template and compile the desired layout

                    });

                    /**
                     * @function
                     * @description
                     * Set defaults into the scope object
                     */
                    function init(message) {
                        scope.workerid = workerid;
                        scope.template = template || PERFORMANCE_CONFIG.webworker_Message_template;
                        initWorker(scope.workerid, message);
                    }

                    /**
                     * @function
                     * @description
                     * Gets the message from the worker.
                     */
                    function initWorker(workerid, message) {
                        WebWorkerFactory.runTask(workerid, message);
                        var messageFromWorker = WebWorkerFactory._resultMessage;

                        if (messageFromWorker) {
                            scope.messageFromWorker = messageFromWorker;
                        }
                    }

                    /**
                     * @function
                     * @description
                     * Gets the template and compile the desired layout.
                     * Based on $compile, it compiles a piece of HTML string or DOM into the retrieved
                     * template and produces a template function, which can then be used to link scope and
                     * the template together.
                     */
                    function compileTemplate($http, $templateCache, $compile) {
                        $http.get(scope.template, {
                                //This allows you can get the template again by consuming the
                                //$templateCache service directly.
                                cache: $templateCache
                            })
                            .success(function (html) {
                                element.html(html);
                                $compile(element.contents())(scope);
                            });
                    }
                }
            };
        }]);

})();

(function() {
    'use strict';

    WebWorkerPoolFactory.$inject = ["$log", "$q", "PERFORMANCE_CONFIG"];
    angular.module('appverse.performance')
        .factory('WebWorkerPoolFactory', WebWorkerPoolFactory);


    /**
     * @ngdoc service
     * @name WebWorkerFactory
     * @module appverse.performance
     *

     * @description
     * This factory starts a pooled multithreaded execution of a webworker:
     * <pre></code>                _______
     *                            |       |-> thread 1
     * USER -> message -> task -> | pool  |-> thread 2
     *                            |_______|-> thread N
     * </code></pre>
     *
     * @requires https://docs.angularjs.org/api/ngMock/service/$q $q
     * @requires https://docs.angularjs.org/api/ngMock/service/$log $log
     * @requires PERFORMANCE_CONFIG
     */
    function WebWorkerPoolFactory ($log, $q, PERFORMANCE_CONFIG) {

        var factory = {
            _poolSize: PERFORMANCE_CONFIG.webworker_pooled_threads,
            _authorizedWorkersOnly: PERFORMANCE_CONFIG.webworker_authorized_workers_only,
            _workersDir: PERFORMANCE_CONFIG.webworker_directory,
            _workersList: PERFORMANCE_CONFIG.webworker_authorized_workers,
            _resultMessage: ''
        };

        $log.debug("Initializated webworkers factory preconfigured values." );
        $log.debug("Default pool size: " + factory._poolSize);
        $log.debug("Are only authorized preconfigured workers? " + factory._authorizedWorkersOnly);
        $log.debug("The folder for webworkers in the app: " + factory._workersDir);
        $log.debug("Number of members in the workers list: " + factory._workersList.length);

        /**
         * @ngdoc method
         * @name WebWorkerFactory#runParallelTasksGroup
         *
         * @param {number} workerData WorkerData object with information of the task to be executed
         * @param {object} workerTasks Array with a group of WorkerTask objects for the same WorkerData
         *
         * @description
         * Runs a group of parallelized tasks
         * Run a set of workers according to the pre-defined data in configuration
         * (id, type, size in pool and worker file).
         * Pe-definition in configuration is mandatory.
         * The group of tasks are up to the caller.
         */
        factory.runParallelTasksGroup = function (workerData, workerTasks) {
            this.workerData = workerData;


            $log.debug("Started parallelized execution for worker: ");
            $log.debug(workerData.toString());


            //Initializes the pool with the indicated size for that worker group
            var pool = new factory.WorkerPool(this.workerData.poolSize);
            pool.init();

            //Create a worker task for
            if(workerTasks && workerTasks.length > 0){
                // iterate through all the parts of the image
                for (var x = 0; x < workerTasks.length; x++) {
                    var workerTask = workerTasks[x];

                    pool.addWorkerTask(workerTask);
                }
            }

            return factory._resultMessage;
        };


        /**
         * @ngdoc method
         * @name WebWorkerFactory#passMessage
         *
         * @param {number} id of the called worker
         * @param {object} function as callback
         * @param {string} message to be passed to the worker
         * @description
         * Execute a task in a worker.
         * The group of task is the same as the number indicated in the pool size for that pre-configured worker.
         */
        factory.runTask = function (workerId, message, callback) {

            var pool = new factory.WorkerPool(factory._poolSize);
            pool.init();

            /*
             If only workers in the configuration file are allowed.
             No fallback needed.
             */
            var workerData;
            var workerTask;
            if(factory._authorizedWorkersOnly){
                if(workerId){
                    //Get data from configuration for the worker from the provided ID
                    workerData = factory.getWorkerFromId(workerId);
                }else{
                    //NO VALID WORKER ID ERROR
                    $log.error("NO VALID WORKER ID ERROR");
                }
            }else{
                //If any provided worker is allowed the workerId arg is the complete path to the worker file
                //The ID is not important here
                if(workerId){
                    workerData = new WorkerData(1001, 'dedicated', workerId);
                }else{
                    //NO VALID WORKER ID ERROR
                    $log.error("NO VALID WORKER ID ERROR");
                }
            }

            if(workerData) {
                pool = new factory.WorkerPool(workerData.poolSize);
                /*
                 Create the worker task for the pool (only one task, passed N times):
                 workerName: File of the worker
                 callback: Register the supplied function as callback
                 message: The last argument will be used to send a message to the worker
                 */
                workerTask = new factory.WorkerTask(workerData, callback, message);
                // Pass the worker task object to the execution pool.
                // The default behavior is create one task for each thread in the pool.
                for(var i = 0; i < factory._poolSize; i++){
                    pool.addWorkerTask(workerTask);
                }
            }else{
                //NO WORKER DATA ERROR
                $log.error("NO WORKER DATA ERROR");
            }


            //return _resultMessage;
        };


        factory.WorkerPool = function(poolSize) {
            var _this = this;
            if(!poolSize) {
                this.size = factory._poolSize;
            }else{
                this.size = poolSize;
            }

            //Initialize some vars with default values
            this.taskQueue = [];
            this.workerQueue = [];

            //Start the thread pool. To be used by the caller.
            this.init = function() {
                //Create the 'size' number of worker threads
                for (var i = 0 ; i < _this.size ; i++) {
                    _this.workerQueue.push(new WorkerThread(_this));
                }
            };


            this.addWorkerTask = function(workerTask) {
                if (_this.workerQueue.length > 0) {
                    // get the worker from the front of the queue
                    var workerThread = _this.workerQueue.shift();
                    workerThread.run(workerTask);
                } else {
                    // If there are not free workers the task is put in queue
                    _this.taskQueue.push(workerTask);
                }
            };


            //Execute the queued task. If empty, put the task to the queue.
            this.freeWorkerThread = function(workerThread) {
                if (_this.taskQueue.length > 0) {
                    // It is not put back in the queue, but it is executed on the next task
                    var workerTask = _this.taskQueue.shift();
                    workerThread.run(workerTask);
                } else {
                    _this.taskQueue.push(workerThread);
                }
            };

        };

        //Runner work tasks in the pool
        function WorkerThread(parentPool) {

            var _this = this;
            this.parentPool = parentPool;
            this.workerTask = {};

            //Execute the task
            this.run = function(workerTask) {
                _this.workerTask = workerTask;

                //Create a new web worker
                if (_this.workerTask.script != null) {
                    /*
                     Creation of workers.
                     For both dedicated and shared workers, you can also attach to the
                     message event handler event type by using the addEventListener method.
                     */
                    var worker;
                    if(workerTask.type == PERFORMANCE_CONFIG.webworker_dedicated_literal){
                        worker = new Worker(_this.workerTask.script);
                        worker.addEventListener('message', _this.OnWorkerMessageHandler, false);
                        worker.postMessage(_this.workerTask.startMessage);
                    }else if(workerTask.type == PERFORMANCE_CONFIG.webworker_shared_literal){
                        worker = new SharedWorker(_this.workerTask.script);
                        worker.port.addEventListener('message', _this.OnWorkerMessageHandler, false);
                        worker.port.postMessage(_this.workerTask.startMessage);
                    }else{
                        //NO TYPE ERROR
                        $log.error("NO VALID WORKER TYPE");
                    }
                }
            };

            //We assume we only get a single callback from a worker as a handler
            //It also indicates the end of this worker.
            _this.OnWorkerMessageHandler = function (evt) {
                // pass to original callback
                _this.workerTask.callback(evt);

                // We should use a separate thread to add the worker
                _this.parentPool.freeWorkerThread(_this);
            };
        }


        //The task to run
        factory.WorkerTask = function (workerData, callback, msg) {
            this.script = workerData.file;
            if(callback){
                this.callback = callback;
            }else{
                this.callback = defaultEventHandler;
            }
            this.startMessage = msg;
            this.type = workerData.type;
        };

        /*
         Default event handler.
         */
        function defaultEventHandler(event){
            factory._resultMessage = event.data;
        }

        //Data object for a worker
        function WorkerData(workerId, type, poolSize, worker) {
            this.id = workerId;
            this.type = type;
            this.poolSize = poolSize;
            this.file = worker;
        }

        WorkerData.prototype.toString = function(){
            return "ID: " + this.id + "|TYPE: " + this.type + "|POOL SIZE: " + this.poolSize + "|FILE: " + this.file;

        };

        //Extract worker information from configuration
        factory.getWorkerFromId = function (workerId, poolSize){
            this.id = workerId;
            this.type = '';
            this.poolSize = poolSize;
            this.file = '';

            for(var i = 0; i < factory._workersList.length; i++) {
                if(factory._workersList[i].id === workerId){
                    this.type = factory._workersList[i].type;
                    if(!this.poolSize || this.poolSize == 0){
                        this.poolSize = factory._workersList[i].poolSize;
                    }else{
                        this.poolSize = poolSize;
                    }

                    this.file = factory._workersDir + factory._workersList[i].file;
                    break;
                }
            }

            var workerData = new WorkerData(this.id, this.type, this.poolSize, this.file);

            return workerData;
        };

        return factory;
    }

})();
(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.rest
     * @description
     *
     * The Integrated REST module includes communication.
     *
     * It is based on Restangular.
     *
     * Params configuration are set in app-configuration file as constants.
     *
     * ## Services Client Configuration
     *
     * The common API includes configuration for one set of REST resources client (1 base URL).
     * This is the most common approach in the most of projects.
     * In order to build several sets of REST resources (several base URLs) you should
     * create scoped configurations. Please, review the below snippet:
     *
     *     var MyRestangular = Restangular.withConfig(function(RestangularConfigurer) {
     *       RestangularConfigurer.setDefaultHeaders({'X-Auth': 'My Name'})
     *     });
     *
     *     MyRestangular.one('place', 12).get();
     *
     * The MyRestangular object has scoped properties of the Restangular on with a different
     * configuration.
     *
     * @requires  https://github.com/mgonto/restangular restangular
     * @requires  appverse.configuration
     * @requires  appverse.utils
     *
     */
    angular.module('appverse.rest', [
        'restangular',
        'appverse.configuration',
        'appverse.utils'
    ])

    .run(["$injector", "$log", "Restangular", "ModuleSeeker", "REST_CONFIG", function($injector, $log, Restangular, ModuleSeeker, REST_CONFIG) {

        $log.info('appverse.rest run');

        tryToIntegrateSecurity();
        tryToIntegrateCache();

        Restangular.setBaseUrl(REST_CONFIG.BaseUrl);
        Restangular.setExtraFields(REST_CONFIG.ExtraFields);
        Restangular.setParentless(REST_CONFIG.Parentless);
        Restangular.setRestangularFields(REST_CONFIG.RestangularFields);
        Restangular.setMethodOverriders(REST_CONFIG.MethodOverriders);
        Restangular.setFullResponse(REST_CONFIG.FullResponse);
        if (REST_CONFIG.DefaultHeaders) {
            Restangular.setDefaultHeaders(REST_CONFIG.DefaultHeaders);
        }
        Restangular.setRequestSuffix(REST_CONFIG.RequestSuffix);
        Restangular.setUseCannonicalId(REST_CONFIG.UseCannonicalId);
        Restangular.setEncodeIds(REST_CONFIG.EncodeIds);

        function tryToIntegrateSecurity() {
            var restFactory = $injector.get('RESTFactory'),
                $log = $injector.get('$log'),
                SECURITY_GENERAL = $injector.get('SECURITY_GENERAL');

            if (ModuleSeeker.exists('appverse.security')) {
                var oauthRequestWrapperService = $injector.get('Oauth_RequestWrapper');
                if (SECURITY_GENERAL.securityEnabled) {
                    restFactory.wrapRequestsWith(oauthRequestWrapperService);
                    $log.debug("REST communication is secure. Security is enabled." +
                        " REST requests will be wrapped with authorization headers.");
                    return;
                }
            }

            $log.debug("REST communication is not secure. Security is not enabled.");
        }

        function tryToIntegrateCache() {
            if (ModuleSeeker.exists('appverse.cache')) {
                var restFactory = $injector.get('RESTFactory'),
                    avCacheFactory = $injector.get('avCacheFactory'),
                    cache = avCacheFactory.getHttpCache();
                restFactory.setCache(cache);
            }
        }

        if (REST_CONFIG.HATEOAS) {

            var CONTENT_TAG = 'content';
            var HREF_TAG = 'href';
            var LINKS_TAG = 'links';

            Restangular.setResponseExtractor(function(data, operation) {
                var returnData = data;
                if (operation === 'getList' && CONTENT_TAG in data) {
                    for (var i = 0; i < data[CONTENT_TAG].length; i++) {
                        data[CONTENT_TAG][i][HREF_TAG] = data[CONTENT_TAG][i][LINKS_TAG][0][HREF_TAG];
                        delete data[CONTENT_TAG][i][LINKS_TAG];
                    }
                    returnData = data[CONTENT_TAG];
                    delete data[CONTENT_TAG];
                    for (var key in data) {
                        returnData[key] = data[key];
                    }
                }
                return returnData;
            });
        }
    }]);

})();
(function() {
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
        ["$log", "Restangular", "$rootScope", "$timeout", "REST_CONFIG", "RESTFactory", function($log, Restangular, $rootScope, $timeout, REST_CONFIG, RESTFactory) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

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

                    scope.$watchCollection(function() {
                        return [attrs.avRestGet, attrs.restId, attrs.restName];
                    }, function(newCollection, oldCollection, scope) {
                        $log.debug('avRestGet watch ' + name + ':', newCollection);
                        scope[name + errorSuffix] = false;

                        if (attrs.restId) {
                            Restangular.all(attrs.avRestGet).one(attrs.restId).get().then(onSuccess, onError);
                        } else {
                            Restangular.all(attrs.avRestGet).getList().then(onSuccess, onError);
                        }

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function() {
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
                            $timeout(function() {
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
        }])

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
        ["$log", "$rootScope", "$timeout", "REST_CONFIG", "RESTFactory", function($log, $rootScope, $timeout, REST_CONFIG, RESTFactory) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

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
                            $timeout(function() {
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
                            $timeout(function() {
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
        }])

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
        ["$log", "$rootScope", "Restangular", "$timeout", "REST_CONFIG", "RESTFactory", function($log, $rootScope, Restangular, $timeout, REST_CONFIG, RESTFactory) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

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

                        item = angular.copy(item);
                        delete item.editing;

                        if (item.fromServer) {
                            item.put().then(onSuccess, onError);

                            collection.some(function(element, idx) {
                                if (element[Restangular.configuration.restangularFields.id] === item[Restangular.configuration.restangularFields.id]) {
                                    index = idx;
                                    return true;
                                }
                            });
                            collection[index][savingProperty] = true;
                        } else {
                            delete item[Restangular.configuration.restangularFields.id];
                            collection.post(item).then(onSuccess, onError);
                            collection[savingProperty] = true;
                        }

                        var func = RESTFactory.afterRoute[name];
                        if (func) {
                            func();
                        }

                        function onSuccess(data) {
                            $log.debug('onSuccess', data);
                            $timeout(function() {
                                if (item.fromServer) {
                                    collection[index] = data;
                                } else {
                                    collection.push(data);
                                    delete collection[savingProperty];
                                }
                                var func = RESTFactory.afterRoute[name];
                                if (func) {
                                    func();
                                }
                            }, REST_CONFIG.Timeout);
                        }

                        function onError(response) {
                            $log.debug('onError', response);
                            $timeout(function() {
                                scope[name + errorSuffix] = true;

                                if (index > -1) {
                                    delete collection[index][savingProperty];
                                } else {
                                    delete collection[savingProperty];
                                }

                                var func = RESTFactory.afterRoute[name];
                                if (func) {
                                    func();
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
        }])

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
        ["$log", function($log) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        var collection = scope.$eval(attrs.avRestAdd);

                        $log.debug('avRestAdd directive', collection);

                        collection.unshift({
                            editing: true,
                            getParentList: function() {
                                return collection;
                            }
                        });

                        scope.$applyAsync();
                    });
                }
            };
        }])

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
        ["$log", function($log) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        var item = scope.$eval(attrs.avRestClone),
                            collection = item.getParentList();

                        $log.debug('avRestClone directive', item);

                        var copy = item.clone();
                        copy.editing = true;
                        copy.fromServer = false;
                        collection.unshift(copy);

                        scope.$applyAsync();
                    });
                }
            };
        }])

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
        ["$log", function($log) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

                        var item = scope.$eval(attrs.avRestEdit);

                        $log.debug('avRestEdit directive', item);

                        scope.copy = item.clone();
                        item.editing = true;

                        scope.$applyAsync();
                    });
                }
            };
        }])

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
        ["$log", function($log) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {

                    element.bind('click', function() {

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
        }]);
})();
(function () {
    'use strict';

    RESTFactory.$inject = ["$log", "$q", "$http", "Restangular", "REST_CONFIG"];
    angular.module('appverse.rest').factory('RESTFactory', RESTFactory);

    /**
     * @ngdoc service
     * @name RESTFactory
     * @module appverse.rest
     * @description
     * Contains methods for data finding (demo).
     * This module provides basic quick standard access to a REST API.
     *
     * @requires https://docs.angularjs.org/api/ngMock/service/$log $log
     * @requires https://docs.angularjs.org/api/ngMock/service/$q $q
     * @requires https://docs.angularjs.org/api/ngMock/service/$http $http
     * @requires https://github.com/mgonto/restangular Restangular
     * @requires REST_CONFIG
     */
    function RESTFactory($log, $q, $http, Restangular, REST_CONFIG) {

        ////////////////////////////////////////////////////////////////////////////////////
        // ADVICES ABOUT PROMISES
        //
        // 1-PROMISES
        // All Restangular requests return a Promise. Angular's templates
        // are able to handle Promises and they're able to show the promise
        // result in the HTML. So, if the promise isn't yet solved, it shows
        // nothing and once we get the data from the server, it's shown in the template.
        // If what we want to do is to edit the object you get and then do a put, in
        // that case, we cannot work with the promise, as we need to change values.
        // If that's the case, we need to assign the result of the promise to a $scope variable.
        // 2-HANDLING ERRORS
        // While the first param is te callback the second parameter is the error handler function.
        //
        //  Restangular.all("accounts").getList().then(function() {
        //      console.log("All ok");
        //  }, function(response) {
        //      console.log("Error with status code", response.status);
        //  });
        // 2-HANDLING LISTS
        // The best option for doing CRUD operations with a list,
        // is to actually use the "real" list, and not the promise.
        // It makes it easy to interact with it.
        ////////////////////////////////////////////////////////////////////////////////////

        var factory = {
            afterRoute: {}
        };

        /**
         * @ngdoc method
         * @name RESTFactory#wrapRequestWith
         *
         * @param {object} The request wrapper
         * @description Wraps a request.
         * The wrapper should expose a 'wrapRequest(Restangular)' function
         * that wraps the requests and returns the processed Restangular service
         */
        factory.wrapRequestsWith = function (wrapper) {
            Restangular = wrapper.wrapRequest(Restangular);
        };

        /**
         * @ngdoc method
         * @name RESTFactory#setCache
         *
         * @description Sets the cache. Caching also depends on REST_CONFIG
         */
        factory.setCache = function (cache) {
            Restangular.setResponseInterceptor(
                function (data, operation) {
                    // Caches response data or not according to configuration.
                    if (cache) {
                        if (REST_CONFIG.NoCacheHttpMethods[operation] === true) {
                            cache.removeAll();
                        }
                    }
                    return data;
                }
            );
        };

        /**
         * @ngdoc method
         * @name RESTFactory#setAfterRoute
         * @param {string} Route as passed to Restangular
         * @param {function} Function to execute
         * @description Adds a function to execute after any REST operation on the given route
         */
        factory.setAfterRoute = function (route, func) {
            factory.afterRoute[route] = func;
        };

        /**
         * @ngdoc method
         * @name RESTFactory#readBatch
         *
         * @param {String} path The item URL
         * @description Returns a complete list from a REST resource.
         * It is specially recommended when retrieving large amounts of data. Restangular adds 4 additional fields
         * per each record: route, reqParams, parentResource and restangular Collection.
         * These fields add a lot of weight to the retrieved JSON structure.
         * So, we need the lightest as possible data weight.
         * This method uses the $http AngularJS service. So, Restangular object settings are not applicable.
         * @returns {object} Promise with a large data structure
         */
        factory.readBatch = function (path) {
            var d = $q.defer();
            $http.get(Restangular.configuration.baseUrl + '/' + path + Restangular.configuration.suffix)
                .success(function (data) {
                    d.resolve(data);
                });
            return d.promise;
        };

        /**
         * @ngdoc method
         * @name RESTFactory#readParallelMultipleBatch
         *
         * @param {String} paths An array with URLs for each resource
         * @description Returns a combined result from several REST resources in chained promises.
         * It is specially recommended when retrieving large amounts of data. Restangular adds 4 additional fields
         * per each record: route, reqParams, parentResource and restangular Collection.
         * These fields add a lot of weight to the retrieved JSON structure.
         * So, we need the lightest as possible data weight.
         * This method uses the $http AngularJS service. So, Restangular object settings are not applicable.
         * @returns {object} Promise with a large data structure
         */
        factory.readParallelMultipleBatch = function (paths) {
            var promises = [];

            angular.forEach(paths, function (path) {

                var deferred = $q.defer();
                factory.readBatch(path).then(function (data) {
                        deferred.resolve(data);
                    },
                    function () {
                        deferred.reject();
                    });

                promises.push(deferred.promise);

            });

            return $q.all(promises);
        };

        return factory;

    }

})();

(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.router
     * @description Adds routing capabilities to the application
     *
     * @requires https://github.com/angular-ui/ui-router ui.router
     */
    angular.module('appverse.router', [
        'ui.router',
        'appverse.configuration.default'
    ]);
})();

(function() {
    'use strict';

    angular.module('appverse.router')

    .config(["$urlRouterProvider", "ROUTER_CONFIG", function($urlRouterProvider, ROUTER_CONFIG) {

        if (ROUTER_CONFIG.loadStatesEnabled) {
            $urlRouterProvider.deferIntercept();
        }
    }]);
})();

(function () {
    'use strict';

    angular.module('appverse.router')

    .run(["$log", "$rootScope", "$state", "$stateParams", "ROUTER_CONFIG", "avStates", function ($log, $rootScope, $state, $stateParams, ROUTER_CONFIG, avStates) {

        $log.debug('appverse.router run');

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        if (ROUTER_CONFIG.loadStatesEnabled && ROUTER_CONFIG.autoLoadStates) {
            avStates.loadStates();
        }
    }]);
})();

(function() {
    'use strict';

    angular.module('appverse.router')

    .provider('avStates', ["$stateProvider", function($stateProvider) {

        var provider = this;
        provider.stateFunctions = {};
        provider.globalFunctions = {};

        provider.setFunction = function(functionName, functionObject, stateName) {
            if (stateName) {
                if (!provider.stateFunctions[stateName]) {
                    provider.stateFunctions[stateName] = {};
                }
                provider.stateFunctions[stateName][functionName] = functionObject;
            } else {
                provider.globalFunctions[functionName] = functionObject;
            }
        };

        provider.$get = /*@ngInject*/ ["$log", "$http", "ROUTER_CONFIG", "REST_CONFIG", "$urlRouter", function($log, $http, ROUTER_CONFIG, REST_CONFIG, $urlRouter) {

            return {
                loadStates: function(statesObject) {

                    if (statesObject) {
                        $log.debug('States object detected. It will be used to load states.');
                        parseStates(statesObject);
                    } else {
                        var url = ROUTER_CONFIG.statesUrl;

                        if (ROUTER_CONFIG.prependBaseUrl) {
                            url = REST_CONFIG.BaseUrl + url;
                        }

                        if (ROUTER_CONFIG.appendRequestSuffix) {
                            url += REST_CONFIG.RequestSuffix;
                        }

                        $log.debug('Getting states from ' + url);
                        $http.get(url).then(function(response) {
                            parseStates(response.data);
                        });
                    }

                    $urlRouter.listen();

                    function parseStates(statesObject) {

                        $log.debug('States object', statesObject);

                        angular.forEach(statesObject, function(stateConfig, stateName) {

                            $log.debug('Adding state:', stateName);

                            angular.forEach(provider.globalFunctions, function(value, key) {
                                stateConfig[key] = value;
                            });

                            if (provider.stateFunctions) {
                                angular.forEach(provider.stateFunctions[stateName], function(value, key) {
                                    stateConfig[key] = value;
                                });
                            }

                            $stateProvider.state(stateName, stateConfig);
                        });

                        $urlRouter.sync();
                    }
                }
            };
        }];
    }]);
})();

(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.serverPush
     * @description
     * This module handles server data communication when it pushes them to the client
     * exposing the factory WebSocketFactory, which is an API for instantiating sockets
     * that are integrated with Angular's digest cycle.
     *
     * Using WebSockets is a modern, bidirectional protocol that enables an interactive communication
     * session between the browser and a server. Its main current drawback is
     * that implementation is generally only available in the latest browsers.
     *
     * @requires  appverse.configuration
     */
    angular.module('appverse.serverPush', ['appverse.configuration'])

    .run(["$log", function ($log) {
        $log.info('appverse.serverPush run');
    }]);

})();

/*globals SockJS:false, Stomp:false, MozWebSocket:false */
(function() {
    'use strict';

    angular.module('appverse.serverPush')

    /**
     * @ngdoc service
     * @name WebSocketFactory
     * @module appverse.serverPush
     *
     * @requires https://docs.angularjs.org/api/ngMock/service/$log $log
     * @requires WEBSOCKETS_CONFIG
     */
    .factory('WebSocketFactory',
        ["$log", function($log) {

            var WEBSOCKETS_CONFIG = angular.injector(['appverse.configuration.default']).get('WEBSOCKETS_CONFIG');

            var factory = {};

            /**
                @ngdoc method
                @name WebSocketFactory#open
                @param {string} itemId The id of the item
                @description Establishes a connection to a swebsocket endpoint.
            */
            factory.open = function(url, onmessage, onopen, onerror, onclose) {

                if (factory.ws) {
                    $log.warn('WebSocket connection is already opened. Closing it before opening a new one.');
                    factory.close().then(function() {
                        factory.open(url, onmessage, onerror, onclose);
                    });
                    return;
                }

                var ws = null;

                if (!url) {
                    url = WEBSOCKETS_CONFIG.WS_URL;
                }

                if (WEBSOCKETS_CONFIG.WS_TYPE === 'auto') {
                    //check if SockJS is avaiable
                    if ('SockJS' in window) {
                        ws = new SockJS(url);
                    }
                } else if (WEBSOCKETS_CONFIG.WS_TYPE === 'sockjs') {
                    ws = new SockJS(url);
                }

                //otherwise switches to HTML5 WebSocket native object
                if (ws === null) {
                    $log.debug('WS_TYPE: native');
                    if ('WebSocket' in window) {
                        ws = new WebSocket(url);
                    } else if ('MozWebSocket' in window) {
                        ws = new MozWebSocket(url);
                    }
                } else {
                    $log.debug('WS_TYPE: sockjs');
                }

                ws.onopen = function() {
                    if (ws !== null) {
                        ws.send('');
                    }
                    if (onopen) {
                        onopen();
                    }
                };

                ws.onerror = function(event) {
                    if (onerror) {
                        onerror(event);
                    }
                };

                ws.onmessage = function(message) {
                    if (onmessage) {
                        onmessage(message);
                    }
                };

                ws.onclose = function() {
                    if (onclose) {
                        onclose();
                    }
                };

                factory.ws = ws;
            };

            /**
                   @ngdoc method
                   @name WebSocketFactory#close
                   @param {string} itemId The id of the item
                   @description Close the WebSocket connection.
               */
            factory.close = function() {
                if (factory.ws) {
                    factory.ws.close();
                    factory.ws = null;
                }
            };

            /**
                   @ngdoc method
                   @name WebSocketFactory#sendRaw
                   @param {object} message Message payload in JSON format.
                   @description Send a raw message to the ws server (without protocol).
               */
            factory.sendRaw = function(message) {
                $log.debug('factory.ws: ' + factory.ws);
                factory.ws.send(message);
            };

            /**
                @ngdoc method
                @name WebSocketFactory#status
                @param {string} itemId The id of the item
                @description WebSocket connection status.
                @returns websocket status code
            */
            factory.status = function() {
                if (factory.ws === null || angular.isUndefined(factory.ws)) {
                    return WebSocket.CLOSED;
                }
                return factory.ws.readyState;
            };

            /**
                @ngdoc method
                @name WebSocketFactory#statusAsText
                @param {string} itemId The id of the item
                @description Returns WebSocket connection status as text.
                @returns status text
            */
            factory.statusAsText = function() {
                var readyState = factory.status();
                if (readyState === WebSocket.CONNECTING) {
                    return WEBSOCKETS_CONFIG.CONNECTING;
                } else if (readyState === WebSocket.OPEN) {
                    return WEBSOCKETS_CONFIG.OPEN;
                } else if (readyState === WebSocket.CLOSING) {
                    return WEBSOCKETS_CONFIG.WS_CLOSING;
                } else if (readyState === WebSocket.CLOSED) {
                    return WEBSOCKETS_CONFIG.WS_CLOSED;
                } else {
                    return WEBSOCKETS_CONFIG.WS_UNKNOWN;
                }
            };


            /**
                @ngdoc method
                @name WebSocketFactory#connect
                @param {object} username
                @param {object} password
                @param {object} onconnectcallback
                @description Stablishes a protocol connection over a websocket connection
            */
            factory.connect = function(login, passcode, connectCallback, errorCallback, debugFunction) {

                if (factory.client) {
                    $log.warn('Client already exists. Please disconnect it before reconnecting.');
                    return;
                }
                if (WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'none') {
                    $log.warn('No protocol configured WS_PROTOCOL_TYPE=none');
                    throw new TypeError('No protocol configured WS_PROTOCOL_TYPE=none');
                }
                if (!factory.ws) {
                    $log.debug('No underlying WebSocket connection found. Opening default one...');
                    factory.open(null, null, function() {
                        factory.connect(login, passcode, connectCallback, errorCallback);
                    });
                    return;
                }
                var client = null;
                //protocol
                if (WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'auto' ||
                    WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'stomp') {
                    if ('Stomp' in window) {
                        client = Stomp.over(factory.ws);

                        $log.debug('WS_TYPE: sockjs');
                        //configure
                        if (WEBSOCKETS_CONFIG.HEARTBEAT_OUTGOING !== null) {
                            client.heartbeat.outgoing = WEBSOCKETS_CONFIG.HEARTBEAT_OUTGOING;
                        }
                        if (WEBSOCKETS_CONFIG.HEARTBEAT_INCOMING !== null) {
                            client.heartbeat.incoming = WEBSOCKETS_CONFIG.HEARTBEAT_INCOMING;
                        }

                        client.debug = debugFunction;

                        //Establish connection
                        client.connect(login, passcode, connectCallback, errorCallback);
                    } else {
                        $log.debug('WS_TYPE: none');
                    }
                }
                factory.client = client;
            };
            /**
                @ngdoc method
                @name WebSocketFactory#subscribe
                @param {object} queueName String that represents the endpoint queue name.
                @param {object} callback .
                @description Subscribe to an specific queue on server side.
                @returns subscription variable (required to unsubscribe)

            */
            factory.subscribe = function(destination, callback, headers) {
                if (!factory.client) {
                    $log.debug('Client does not exists. Connecting to default one...');
                    factory.connect();
                }
                if (typeof callback !== "function") {
                    throw new TypeError(callback + " is not a function.");
                }
                return factory.client.subscribe(destination, callback, headers);
            };

            /**
                @ngdoc method
                @name WebSocketFactory#send
                @param {object} queueName String that represents the endpoint queue name.
                @param {object} headers special headers.
                @param {object} message .
                @description Send a protocol message to the server.
            */
            factory.send = function(queueName, headers, message) {
                if (factory.client === null || angular.isUndefined(factory.client)) {
                    $log.warn('Client does not exists. Please connect first.');
                    return;
                }
                factory.client.send(queueName, headers, message);
            };
            /**
                @ngdoc method
                @name WebSocketFactory#unsubscribe
                @param {object} subscription subscription object provided on subscribe.
                @description Unsubscribe to an specific queue on server side.

            */
            factory.unsubscribe = function(subscription) {
                if (!subscription || angular.isUndefined(subscription)) {
                    $log.warn('Subscription missing. Please provide the subcription object you got when subscribing.');
                    return;
                }
                subscription.unsubscribe();
            };

            /**
                @ngdoc method
                @name WebSocketFactory#disconnect
                @description Disconnects a protocol connection over a websocket connection
            */
            factory.disconnect = function() {
                if (!factory.client || angular.isUndefined(factory.client)) {
                    $log.warn('Client does not exists, please connect first.');
                    return;
                }
                factory.client.disconnect();
                factory.client = null;
            };

            return factory;
        }]
    );


})();

(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.socket.io
     * @description
     * Private module implementing SocketIO. It provides the common API module appverse.serverPush
     * with the socket object wrapping the SocketIO client. This is initializated according
     * to the pre-existing external configuration.
     *
     * @requires  appverse.configuration
     */
    angular.module('appverse.socketio', ['appverse.configuration']);

})();
(function () {
    'use strict';

    angular.module('appverse.socketio')

    /**
     * @ngdoc service
     * @name SocketFactory
     * @module appverse.serverPush
     * @description
     * Although Socket.IO exposes an io variable on the window, it's better to encapsulate it
     * into the AngularJS's Dependency Injection system.
     * So, we'll start by writing a factory to wrap the socket object returned by Socket.IO.
     * This will make easier to test the application's controllers.
     * Notice that the factory wrap each socket callback in $scope.$apply.
     * This tells AngularJS that it needs to check the state of the application and update
     * the templates if there was a change after running the callback passed to it by using dirty checking.
     * Internally, $http works in the same way. After some XHR returns, it calls $scope.$apply,
     * so that AngularJS can update its views accordingly.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$rootScope $rootScope
     * @requires Socket
     */
    .factory('SocketFactory',
        ["$rootScope", "Socket", function ($rootScope, Socket) {
            var factory = {};

            /**
                 @ngdoc method
                 @name SocketFactory#listen
                 @param {string} eventName The name of the event/channel to be listened
                 The communication is bound to rootScope.
                 @param {object} callback The function to be passed as callback.
                 @description Establishes a communication listening an event/channel from server.
                 Use this method for background communication although the current scope is destyroyed.
                 You should cancel communication manually or when the $rootScope object is destroyed.
                 */
            factory.listen = function (eventName, callback) {
                Socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(Socket, args);
                    });
                });
            };

            /**
                 @ngdoc method
                 @name SocketFactory#sendMessage
                 @param {string} eventName The name of the event/channel to be sent to server
                 @param {object} scope The scope object to be bound to the listening.
                 The communication will be cancelled when the scope is destroyed.
                 @param {object} callback The function to be passed as callback.
                 @description Establishes a communication listening an event/channel from server.
                 It is bound to a given $scope object.
                 */
            factory.sendMessage = function (eventName, data, callback) {
                Socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(Socket, args);
                        }
                    });
                });
            };

            /**
                 @ngdoc method
                 @name SocketFactory#unsubscribeCommunication
                 @param {object} callback The function to be passed as callback.
                 @description Cancels all communications to server.
                 The communication will be cancelled without regarding other consideration.
                 */
            factory.unsubscribeCommunication = function (callback) {
                Socket.off(callback());
            };


            return factory;

        }]);

})();
(function () {
    'use strict';

    angular.module('appverse.socketio')

    /**
     * @ngdoc provider
     * @name Socket
     * @module appverse.socket.io
     * @description
     * This provider provides the appverse.serverPush module with the SocketIO
     * client object from pre-existing configuration in application.
     *
     * This object helps the common API module  making  easier to add/remove
     * listeners in a way that works with AngularJS's scope.
     *
     * socket.on / socket.addListener: Takes an event name and callback.
     * Works just like the method of the same name from Socket.IO.
     *
     * socket.removeListener: Takes an event name and callback.
     * Works just like the method of the same name from Socket.IO.
     *
     * socket.emit: sends a message to the server. Optionally takes a callback.
     * Works just like the method of the same name from Socket.IO.
     *
     * socket.forward: allows you to forward the events received by Socket.IO's socket to AngularJS's event system.
     * You can then listen to the event with $scope.$on.
     * By default, socket-forwarded events are namespaced with socket:.
     * The first argument is a string or array of strings listing the event names to be forwarded.
     * The second argument is optional, and is the scope on which the events are to be broadcast.
     * If an argument is not provided, it defaults to $rootScope.
     * As a reminder, broadcasted events are propagated down to descendant scopes.
     *
     * @requires SERVERPUSH_CONFIG
     */
    .provider('Socket',
        function () {

            var SERVERPUSH_CONFIG = angular.injector(['appverse.configuration.default']).get('SERVERPUSH_CONFIG');

            // when forwarding events, prefix the event name
            var prefix = 'socket:',
                ioSocket;

            // expose to provider
            this.$get = ["$rootScope", "$timeout", function ($rootScope, $timeout) {
                /* global io */

                /*
                Initialization of the socket object by using params in configuration module.
                Please read below for configuration detals:
                * Client configuration: https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#client
                * Server configuration: https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#server
                */
                var socket;

                if (ioSocket || window.io) {

                    socket = ioSocket || io.connect(
                        SERVERPUSH_CONFIG.BaseUrl, {
                            'resource': SERVERPUSH_CONFIG.Resource,
                            'connect timeout': SERVERPUSH_CONFIG.ConnectTimeout,
                            'try multiple transports': SERVERPUSH_CONFIG.TryMultipleTransports,
                            'reconnect': SERVERPUSH_CONFIG.Reconnect,
                            'reconnection delay': SERVERPUSH_CONFIG.ReconnectionDelay,
                            'reconnection limit': SERVERPUSH_CONFIG.ReconnectionLimit,
                            'max reconnection attempts': SERVERPUSH_CONFIG.MaxReconnectionAttempts,
                            'sync disconnect on unload': SERVERPUSH_CONFIG.SyncDisconnectOnUnload,
                            'auto connect': SERVERPUSH_CONFIG.AutoConnect,
                            'flash policy port': SERVERPUSH_CONFIG.FlashPolicyPort,
                            'force new connection': SERVERPUSH_CONFIG.ForceNewConnection
                        }
                    );
                }

                var asyncAngularify = function (callback) {
                    return function () {
                        var args = arguments;
                        $timeout(function () {
                            callback.apply(socket, args);
                        }, 0);
                    };
                };

                var addListener = function (eventName, callback) {
                    socket.on(eventName, asyncAngularify(callback));
                };

                var removeListener = function () {
                    socket.removeAllListeners();
                };


                var wrappedSocket = {
                    on: addListener,
                    addListener: addListener,
                    off: removeListener,

                    emit: function (eventName, data, callback) {
                        if (callback) {
                            socket.emit(eventName, data, asyncAngularify(callback));
                        } else {
                            socket.emit(eventName, data);
                        }
                    },

                    forward: function (events, scope) {
                        if (events instanceof Array === false) {
                            events = [events];
                        }
                        if (!scope) {
                            scope = $rootScope;
                        }
                        angular.forEach(events, function (eventName) {
                            var prefixed = prefix + eventName;
                            var forwardEvent = asyncAngularify(function (data) {
                                scope.$broadcast(prefixed, data);
                            });
                            scope.$on('$destroy', function () {
                                socket.removeListener(eventName, forwardEvent);
                            });
                            socket.on(eventName, forwardEvent);
                        });
                    }
                };

                return wrappedSocket;
            }];

            this.prefix = function (newPrefix) {
                prefix = newPrefix;
            };

            this.ioSocket = function (socket) {
                ioSocket = socket;
            };
        });


})();
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.translate
     * @description
     * The Internationalization module handles languages in application.
     * It should be directly configurable by developers.
     * **Warning**: Items in each translations object must match items defined in the Configuration module.
     *
     * @requires https://github.com/angular-translate/angular-translate pascalprecht.translate
     * @requires https://github.com/lgalfaso/angular-dynamic-locale tmh.dynamicLocale
     * @requires appverse.configuration
     */
    configBlock.$inject = ["$translateProvider", "I18N_CONFIG", "tmhDynamicLocaleProvider", "$provide"];
    runBlock.$inject = ["$log"];
    angular.module('appverse.translate', [
        'pascalprecht.translate',
        'appverse.configuration',
        'tmh.dynamicLocale'
    ])

    // Get module and set config and run blocks
    //angular.module('appverse.translate')
    .config(configBlock)
        .run(runBlock);


    function configBlock($translateProvider, I18N_CONFIG, tmhDynamicLocaleProvider, $provide) {

        var filesConfig = {
            prefix: 'resources/i18n/',
            suffix: '.json'
        };

        $translateProvider.useStaticFilesLoader(filesConfig);
        $translateProvider.preferredLanguage(I18N_CONFIG.PreferredLocale);
        tmhDynamicLocaleProvider.localeLocationPattern(I18N_CONFIG.localeLocationPattern);

        // Decorate translate directive to change the original behaviour
        // by not removing <i> tags included in the translation text
        $provide.decorator('translateDirective', decorateTranslateDirective);

    }


    function runBlock($log) {

        $log.info('appverse.translate run');

    }


    /**
     * Function used by Angular Decorator to override the behaviour of the original
     * translate directive, which does not keep html tags included in the text to be translated.
     * This will make the directive able to keep no-text tags like <i class="icon"></i>
     * after the translation
     *
     * @param  {array}      $delegate       The original instance (provided by decorator)
     * @param  {function}   translateFilter
     * @return {array}                      The modified delegate object
     */
    function decorateTranslateDirective($delegate, translateFilter) {

        // Get the original directive and its linking function
        var directive = $delegate[0];
        var originalLinkFunction = directive.link;

        var newLinkFunction = function (scope, $element, attr, ctrl) {

            // Get the element's html and replaces the text to be translated
            // by a placeholder '%%text%%', so that we can later replace this
            // with the translated string
            var text = $element.text();
            var html = $element.html();
            var htmlOnlyTags = html.replace(text, '%%text%%');

            // First we call the original linking function
            // and afterwards we override the '$on' and '$watch' events
            // to maintain html tags.
            originalLinkFunction.apply(this, [scope, $element, attr, ctrl]);

            scope.$on('$translateChangeSuccess', function () {
                translateElement();
            });

            scope.$watch('[translationId, interpolateParams]', function () {
                if (scope.translationId) {
                    translateElement();
                }
            }, true);

            function translateElement() {
                $element.html(translateFilter(scope.translationId, scope.interpolateParams, scope.interpolation));
                var translatedText = $element.text();
                var finalHtml = htmlOnlyTags.replace('%%text%%', translatedText);
                $element.html(finalHtml);
            }

            return;
        };

        // Since this has already been built via directive provider
        // need to put this on compile, not link, property
        directive.compile = function () {
            return newLinkFunction;
        };

        return $delegate;
    }
    decorateTranslateDirective.$inject = ['$delegate', 'translateFilter'];

})();

(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.utils
     * @description Provides utility objects and functions
     *
     * @requires appverse.configuration
     */
    angular.module('appverse.utils', []);

})();

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
/*jslint bitwise: true */
(function() {
    'use strict';

    angular.module('appverse.utils')

    /**
     * @ngdoc service
     * @name BaseUrlSetter
     * @module appverse.utils
     * @description Base64 encoding
     */
    .factory('Base64', function () {
        var keyStr = 'ABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZabcdef' +
            'ghijklmnopqrstuv' +
            'wxyz0123456789+/' +
            '=';
        return {
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);

                return output;
            },

            decode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/\=]/g;
                if (base64test.exec(input)) {
                    alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
                }
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                do {
                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }

                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";

                } while (i < input.length);

                return output;
            }
        };
    });


})();
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

(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.configuration.default
     * @description
     * This module defines default settings.
     */
    angular.module('appverse.configuration.default', []);

})();

(function() { 'use strict';

/**
 * @ngdoc module
 * @name appverse.configuration.loader
 * @description
 * Load default and custom settings into appverse.configuration
 *
 * @requires appverse.utils
 */
angular.module('appverse.configuration.loader', ['appverse.utils']);


})();

(function() { 'use strict';

/**
 * @ngdoc module
 * @name appverse.configuration
 * @requires appverse.detection
 * @description
 * It includes constants for all the common API components. This module is initially empty.
 * When the application bootstraps, it is populated with the combination of default and custom configuration values
 *
 * @requires appverse.configuration.loader
 */
run.$inject = ["$log"];
angular.module('appverse.configuration', ['appverse.configuration.loader'])
    .run(run);

function run($log) {
    $log.info('appverse.configuration run');
}

})();
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name  appverse
     * @description Main module. Bootstraps the application by integrating services that have any relation.
     * It will automatically initialize any of these modules, whose scripts have been loaded:
     * * Bootstrap-based styling and gadgets
     * * Routing
     * * External Configuration
     * * REST Integration
     * * Cache Service
     * * ServerPush
     * * Security
     * * Internationalization
     * * Logging
     *
     * @requires  appverse.utils
     * @requires  appverse.configuration
     */

    /**
     * Main module.
     * Bootstraps the application by integrating services that have any relation.
     */
    config.$inject = ["$compileProvider", "ModuleSeekerProvider", "$injector"];
    angular.module('appverse', ['appverse.utils', 'appverse.configuration'])
        .config(config);

    /**
     * Preliminary configuration.
     *
     * Configures the integration between modules that need to be integrated
     * at the config phase.
     */
    function config($compileProvider, ModuleSeekerProvider, $injector) {

        // sanitize hrefs
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|itms-services):/);

        // Integrate modules that have a dependency
        if (ModuleSeekerProvider.exists('appverse.detection')) {
            var detectionProvider = $injector.get('DetectionProvider');
            var configLoaderProvider = $injector.get('ConfigLoaderProvider');
            configLoaderProvider.setDetection(detectionProvider);

            if (ModuleSeekerProvider.exists('appverse.logging')) {
                var formattedLoggerProvider = $injector.get('FormattedLoggerProvider');
                formattedLoggerProvider.setDetection(detectionProvider);
            }
        }
    }

})();

(function() {
    'use strict';

    configFn.$inject = ["ConfigLoaderProvider"];
    angular.module('appverse.configuration.loader')

    /**
     * @ngdoc provider
     * @name ConfigLoader
     * @module appverse.configuration.loader
     *
     * @description
     * Loads configuration parameters int the AppConfiguration module.
     */
    .provider('ConfigLoader', ConfigLoaderProvider)
        .config(configFn);

    function ConfigLoaderProvider() {

        // By default, no detection is present
        var detection = new NoDetection(),
            // Object used to perfom default config overriding
            appConfigTemp = {};

        /**
         * @ngdoc method
         * @name  ConfigLoader#$get
         * @description Factory function. Gets the service instance
         */
        this.$get = function() {
            return this;
        };

        /**
         * @ngdoc method
         * @name  ConfigLoader#load
         * @param {object} settings See appverse.configuration.default for available settings
         * @description Loads the custom config, overriding defaults
         */
        this.load = function(settings) {
            this.loadDefaultConfig()
                .loadCustomConfig(settings)
                .overrideDefaultConfig();
        };

        /**
         * @ngdoc method
         * @name  ConfigLoader#setDetection
         * @param {object} detectionProvider Detection provider from appverse.detection
         */
        this.setDetection = function(detectionProvider) {
            detection = detectionProvider;
        };

        // ---- Privates -----
        this.loadDefaultConfig = function() {
            angular.forEach(angular.module('appverse.configuration.default')._invokeQueue, function(element) {
                appConfigTemp[element[2][0]] = element[2][1];
            });
            return this;
        };

        this.loadCustomConfig = function(settings) {
            if (settings) {
                this.settings = settings;
            }
            this.loadMobileConfigIfRequired();
            this.loadEnvironmentConfig();
            return this;
        };

        this.overrideDefaultConfig = function() {
            angular.forEach(appConfigTemp, function(propertyValue, propertyName) {
                angular.module('appverse.configuration').constant(propertyName, propertyValue);
            });
        };

        this.loadMobileConfigIfRequired = function() {
            if (detection.hasAppverseMobile()) {
                this.loadAppverseMobileConfig();
            } else if (detection.isMobileBrowser()) {
                this.loadMobileBrowserConfig();
            }
        };

        this.loadEnvironmentConfig = function() {
            if (this.settings && this.settings.environment) {
                this.addConfig(this.settings.environment);
            } else {
                this.addConfigFromJSON('resources/configuration/environment-conf.json');
            }
            return this;
        };

        this.loadAppverseMobileConfig = function() {
            if (this.settings && this.settings.appverseMobile) {
                this.addConfig(this.settings.appverseMobile);
            } else {
                this.addConfigFromJSON('resources/configuration/appversemobile-conf.json');
            }
            return this;
        };

        this.loadMobileBrowserConfig = function() {
            if (this.settings && this.settings.mobileBrowser) {
                this.addConfig(this.settings.mobileBrowser);
            } else {
                this.addConfigFromJSON('resources/configuration/mobilebrowser-conf.json');
            }

            return this;
        };

        this.addConfig = function(settings) {
            angular.forEach(settings, function(constantObject, constantName) {
                var appConfigObject = appConfigTemp[constantName];

                if (appConfigObject) {
                    angular.forEach(constantObject, function(propertyValue, propertyName) {
                        appConfigObject[propertyName] = propertyValue;
                    });
                    appConfigTemp[constantName] = appConfigObject;
                } else {
                    appConfigTemp[constantName] = constantObject;
                }
            });

        };

        this.addConfigFromJSON = function(jsonUrl) {

            // Make syncrhonous request.
            // TODO: make asyncrhonous. Synchronous requests block the browser.
            // Making requests asyncronous will require to manually bootstrap angular
            // when the response is received.
            // Another option is to let the developer inject the configuration in the config phase
            var request = new XMLHttpRequest();
            // `false` makes the request synchronous
            request.open('GET', jsonUrl, false);
            request.send(null);
            var jsonData = JSON.parse(request.responseText);

            this.addConfig(jsonData);
        };
    }

    /**
     * Used when no detection is provided
     */
    function NoDetection() {

        this.hasAppverseMobile = function() {
            return false;
        };

        this.isMobileBrowser = function() {
            return false;
        };
    }

    function configFn(ConfigLoaderProvider) {

        // Automatic loading of default settings
        ConfigLoaderProvider.load({
            environment: {},
            appverseMobile: {},
            mobileBrowser: {}
        });
    }

})();

(function () {
    'use strict';

    angular.module('appverse.configuration.default')

    /*
    PROJECT CONFIGURATION
    This constants can be used to set basic information related to the application.
    All data are auto-explained because their names ;)
     */

    /**
     * @ngdoc object
     * @name PROJECT_DATA
     * @module  appverse.configuration.default
     * @description Basic information related to the application.
     */
    .constant('PROJECT_DATA', {
        ApplicationName: 'Appverse HTML5',
        Version: '0.1',
        Company: 'GFT',
        Year: '2015',
        Team: 'GFT Appverse Web',
        URL: '',
        LoginViewPath: '/login',
        myUrl: '',
        VendorLibrariesBaseUrl: 'bower_components'
    })


    /**
     * @ngdoc object
     * @name IONIC_CONFIG
     * @module  appverse.configuration.default
     * @description Parent state name of desktop + Ionic application.
     */
    .constant('IONIC_CONFIG', {
        suffix: '-mobile',
        modalPrompt: false,
        redirectionPath: 'home'
    })

    /**
     * @ngdoc object
     * @name LOGGING_CONFIG
     * @module  appverse.configuration.default
     * @description This section contains basic configuration for appverse.logging
     * These params do not affect normal usage of $log service.
     */
    .constant('LOGGING_CONFIG', {
        /*
        This param enables (if true) sending log messages to server.
        The server side REST service must record messages from client in order to be analyzed.
        ALL messages are sent. It is not yet possible select which type of log messages are sent.
         */
        ServerEnabled: false,
        LogServerEndpoint: 'http://localhost:9000/log',
        /*
        This preffix will be included at the beginning of each message.
         */
        CustomLogPreffix: 'APPLOG',
        /*
        Enabled levels will be written in the custom format.
        This param does not affect to $log service.
         */
        EnabledLogLevel: true,
        EnabledErrorLevel: true,
        EnabledDebugLevel: true,
        EnabledWarnLevel: true,
        EnabledInfoLevel: true,
        /*
        Format of the datetime information.
         */
        LogDateTimeFormat: '%Y-%M-%d %h:%m:%s:%z',
        /*
        Fields that will be included in the log message if containing information.
         */
        LogTextFormat: ''
    })

    /**
     * @ngdoc object
     * @name CACHE_CONFIG
     * @module  appverse.configuration.default
     * @description This section contains basic configuration for appverse.cache
     */
    .constant('CACHE_CONFIG', {
        /////////////////////////////
        //SCOPE CACHE
        /////////////////////////////
        ScopeCache_Enabled: true,
        DefaultScopeCacheName: 'appverseScopeDataCache',
        /*
         Max duration in milliseconds of the scope cache
          */
        ScopeCache_duration: 10000,
        /*
         This param turns the scope cache into a LRU one.
         The cache’s capacity is used together to track available memory.
          */
        ScopeCache_capacity: 10,

        /////////////////////////////
        //BROWSER STORAGE TYPE
        //This sets the preferred browser storage in the app.
        //Most of times it is convenient follow a policy for browser storage, using only one of the two types.
        //If you prefer flexibility (the developer makes a choice for each case) do not use the provided API.
        /////////////////////////////
        BrowserStorageCache_Enabled: true,
        /*
         1 = $localStorage
         2 = $sessionStorage
          */
        BrowserStorage_type: '2',
        DefaultBrowserCacheName: 'appverseBrowserCache',
        // Items added to this cache expire after 15 minutes.
        MaxAge: 900000,
        // This cache will clear itself every hour.
        CacheFlushInterval: 3600000,
        // Items will be deleted from this cache right when they expire.
        DeleteOnExpire: 'aggressive',
        //Constant for the literal
        SessionBrowserStorage: 'sessionStorage',
        //Constant for the literal
        LocalBrowserStorage: 'localStorage',
        //Constant for the literal
        NoBrowserStorage: 'none',

        //Direct browser storage (0 local | 1 session)
        browserDirectCacheType: '1',
        /*
         * Specify whether to verify integrity of data saved in localStorage on every operation.
         * If true, angular-cache will perform a full sync with localStorage on every operation.
         * Increases reliability of data synchronization, but may incur a performance penalty.
         * Has no effect if storageMode is set to "none".
         */
        VerifyIntegrity: true,
        /////////////////////////////
        //$http SERVICE CACHE
        /////////////////////////////
        HttpCache_Enabled: true,
        /*
         Max duration in milliseconds of the http service cache.
         */
        HttpCache_duration: 20000,
        /*
         This param turns the http cache into a LRU one.
         The cache’s capacity is used together to track available memory.
         */
        HttpCache_capacity: 10,
        /////////////////////////////
        //BROWSER'S INDEXED DB CACHE
        /////////////////////////////
        IndexedDBCache_Enabled: false,
        /*
         Name of the default object store
          */
        IndexedDB_name: 'DefaultIDBCache',
        /*
         The version for the version (mandatory)
          */
        IndexedDB_version: 1,
        /*
         * The options for the db.
         * The default structure is defined as id/name pairs.
         * It is possible to add more indexes:
         * indexes : [{ name : 'indexName', unique : 'true/false' },{},...]
         */
        IndexedDB_options: [{
            storeName: 'structure-of-items',
            keyPath: 'id',
            indexes: [{
                name: 'name',
                unique: false
            }]
        }]

    })

    /**
     * @ngdoc object
     * @name SERVERPUSH_CONFIG
     * @module  appverse.configuration.default
     * @description This section contains basic configuration for appverse.serverpush.
     * It si related to socket.io configuration params.
     * Read Configuration section in socket.io documentation for further details.
     * https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
     */
    .constant('SERVERPUSH_CONFIG', {
        /*
         URL of the listened server
          */
        BaseUrl: 'http://localhost:3000',
        /*
         Port to be listened at the base url.
          */
        ListenedPort: '3000',
        /*
          resource
          defaults to socket.io
          Note the subtle difference between the server, this one is missing a /.
          These 2 should be in sync with the server to prevent mismatches.
          */
        Resource: 'socket.io',
        /*
          connect timeout
          defaults to 10000 ms
          How long should Socket.IO wait before it aborts the connection attempt with the server to try another fall-back.
          Please note that some transports require a longer timeout than others.
          Setting this really low could potentially harm them.
          */
        ConnectTimeout: '10000',
        /*
          try multiple transports
          defaults to true
          When Socket.IO reconnects and it keeps failing over and over again,
          should it try all available transports when it finally gives up.
          */
        TryMultipleTransports: true,
        /*
          reconnect
          defaults to true
          Should Socket.IO automatically reconnect when it detects a dropped connection or timeout.
          */
        Reconnect: true,
        /*
          reconnection delay
          defaults to 500 ms
          The initial timeout to start a reconnect,
          this is increased using an exponential back off algorithm each
          time a new reconnection attempt has been made.
          */
        ReconnectionDelay: 1000,
        /*
          reconnection limit
          defaults to Infinity
          The maximum reconnection delay in milliseconds, or Infinity.
          */
        ReconnectionLimit: 'Infinity',
        /*
          max reconnection attempts
          defaults to 10
          How many times should Socket.IO attempt to reconnect with the server after a a dropped connection.
          After this we will emit the reconnect_failed event.
          */
        MaxReconnectionAttempts: 5,
        /*
          sync disconnect on unload
          defaults to false
          Do we need to send a disconnect packet to server when the browser unloads.
          */
        SyncDisconnectOnUnload: false,
        /*
          auto connect
          defaults to true
          When code calls io.connect() should Socket.IO automatically establish a connection with the server.
          */
        AutoConnect: true,
        /*
          flash policy port
          defaults to 10843
          If the server has Flashsocket enabled, this should match the same port as the server.
          */
        FlashPolicyPort: '',
        /*
          force new connection
          defaults to false
          Force multiple io.connect() calls to the same server to use different connections.
          */
        ForceNewConnection: false
    })

    /**
     * @ngdoc object
     * @name REST_CONFIG
     * @module  appverse.configuration.default
     * @description This section contains basic configuration for appverse.rest.
     * This module (and/or) its clones is based on Restangular (https://github.com/mgonto/restangular).
     * So, all configuration params are based on its configuration
     * (https://github.com/mgonto/restangular#configuring-restangular).
     * Future updates of Restangular imply review of this section in order
     * to keep consistency between config and the module.
     */
    .constant('REST_CONFIG', {
        /*
        The base URL for all calls to your API.
        For example if your URL for fetching accounts is http://example.com/api/v1/accounts, then your baseUrl is /api/v1.
        The default baseUrl is an empty string which resolves to the same url that AngularJS is running,
        so you can also set an absolute url like http://api.example.com/api/v1
        if you need do set another domain.
        */
        BaseUrl: '/api/v1',

        /*
        Minimum time to wait for each directive operation. It should give the user enough time to see a loading animation using directive variables (Getting, Saving and Removing).
        */
        Timeout: 1000,

        /*
        These are the fields that you want to save from your parent resources if you need to display them.
        By default this is an Empty Array which will suit most cases.
        */
        ExtraFields: [],

        /*
        Use this property to control whether Restangularized elements to have a parent or not.
        This method accepts 2 parameters:
        Boolean: Specifies if all elements should be parentless or not
        Array: Specifies the routes (types) of all elements that should be parentless. For example ['buildings']
        */
        ParentLess: false,

        /*
        HTTP methods will be validated whether they are cached or not.
        */
        NoCacheHttpMethods: {
            'get': false,
            'post': true,
            'put': false,
            'delete': true,
            'option': false
        },

        /*
        Restangular required 3 fields for every "Restangularized" element. These are:

        id: Id of the element. Default: id
        route: Name of the route of this element. Default: route
        parentResource: The reference to the parent resource. Default: parentResource
        restangularCollection: A boolean indicating if this is a collection or an element. Default: restangularCollection
        cannonicalId: If available, the path to the cannonical ID to use. Usefull for PK changes
        etag: Where to save the ETag received from the server. Defaults to restangularEtag
        selfLink: The path to the property that has the URL to this item. If your REST API doesn't return a
        URL to an item, you can just leave it blank. Defaults to href
        Also all of Restangular methods and functions are configurable through restangularFields property.
        All of these fields except for id and selfLink are handled by Restangular,
        so most of the time you won't change them.
        You can configure the name of the property that will be binded to all
        of this fields by setting restangularFields property.
        */
        RestangularFields: {
            id: 'id',
            route: 'route'
        },

        /*
        You can now Override HTTP Methods. You can set here the array of methods to override.
        All those methods will be sent as POST and Restangular will add an X-HTTP-Method-Override
        header with the real HTTP method we wanted to do.
        */
        MethodOverriders: [],

        /*
        You can set default Query parameters to be sent with every request and every method.
        Additionally, if you want to configure request params per method, you can use
        requestParams configuration similar to $http.
        For example RestangularProvider.requestParams.get = {single: true}.
        Supported method to configure are: remove, get, post, put, common (all).
        */
        DefaultRequestParams: {},

        /*
        You can set fullResponse to true to get the whole response every time you do any request.
        The full response has the restangularized data in the data field,
        and also has the headers and config sent. By default, it's set to false.
        */
        FullResponse: false,

        /*
        You can set default Headers to be sent with every request.
        Example:
        DefaultHeaders: {'Content-Type': 'application/json'}
        */
        DefaultHeaders: null,

        /*
        If all of your requests require to send some suffix to work, you can set it here.
        For example, if you need to send the format like /users/123.json you can add that .json
        to the suffix using the setRequestSuffix method
        */
        RequestSuffix: '.json',

        /*
        You can set this to either true or false.
        If set to true, then the cannonical ID from the element will be used for URL creation
        (in DELETE, PUT, POST, etc.).
        What this means is that if you change the ID of the element and then you do a put,
        if you set this to true, it'll use the "old" ID which was received from the server.
        If set to false, it'll use the new ID assigned to the element.
        */
        UseCannonicalId: false,

        /*
        You can set here if you want to URL Encode IDs or not.
        */
        EncodeIds: true,

        /*
         * If true, a response extractor is added to use content property and self links
         */
        HATEOAS: false
    })

    /**
     * @ngdoc object
     * @name I18N_CONFIG
     * @module appverse.configuration.default
     * @description This section contains basic configuration for appverse.translate.
     */
    .constant('I18N_CONFIG', {
        PreferredLocale: 'en-US',
        localeLocationPattern: 'bower_components/angular-i18n/angular-locale_{{locale}}.js'
    })

    /**
     * @ngdoc object
     * @name SECURITY_GENERAL
     * @module appverse.configuration.default
     * @description Includes default information about authentication and authorization configuration based on OAUTH 2.0.
     */
    .constant('SECURITY_GENERAL', {
        securityEnabled: false,
        XSRFCSRFRequestHeaderName: 'X-XSRF-TOKEN',
        XSRFCSRFResponseCookieName: 'XSRF-TOKEN',
        BearerTokenResponseHeader: 'access_token',
        BearerTokenRequestHeader: 'Authorization',
        RefreshTokenResponseHeader: 'refresh_token',
        BearerTokenExpiringResponseHeader: 'expires_in',
        TokenTypeResponseHeader: 'token_type',
        /*
        The XSRF policy type is the level of complexity to calculate the value to be returned in the xsrf header in request
        against the authorization server:
        0: No value is included (The domain is the same one)
        1: $http service built-in solution. The $http service will extract this token from the response header,
         and then included in the X-XSRF-TOKEN header to every HTTP request. The server must check the token
         on each request, and then block access if it is not valid.
        2: Additional calculation of the cookie value using a secret hash. The value is included in the X-XSRF-TOKEN
         request header.
         */
        XSRFPolicyType: 1,
        XSRFSecret: '',
        Headers_ContentType: 'application/json',
        loginHTTPMethod: 'POST',
        loginURL: 'http://localhost:8080/html5-incubator-server/rest/sec/login',
        username: 'admin',
        password: 'admin',
        connected: 'connected',
        disconnected: 'disconnected',
        notEnabled: 'Security not enabled'

    })

    /**
     * @ngdoc object
     * @name SECURITY_OAUTH
     * @module appverse.configuration.default
     * @description Includes default specific settings for OAUTH
     */
    .constant('SECURITY_OAUTH', {
        oauth2_endpoint: 'appverse',
        clientID: '',
        profile: 'http://localhost:8080/html5-incubator-server',
        scope: 'resources',
        scopeURL: 'http://localhost:8080/html5-incubator-server',
        scope_authorizePath: '/oauth/authorize',
        scope_tokenPath: '/oauth/token',
        scope_flow: 'implicit',
        scope_view: 'standard',
        scope_storage: 'none',
        scope_template: 'views/demo/security/oauth_default.html',
        redirectURL: 'http://localhost:9000',
        storage: 'cookies',
        storage_cookies: 'cookies',
        storage_header: 'header',
        tokenResponseHeaderName: 'Authorization'
    })

    /**
     * @ngdoc object
     * @name GOOGLE_AUTH
     * @module appverse.configuration.default
     * @description Defines settings to use Google Oauth2 autentication service
     */
    .constant('GOOGLE_AUTH', {
        clientID: '75169325484-8cn28d7o3dre61052o8jajfsjlnrh53i.apps.googleusercontent.com',
        scopeURL: 'https://www.googleapis.com/auth/plus.login',
        requestvisibleactionsURL: 'http://schemas.google.com/AddActivity',
        theme: 'dark',
        cookiepolicy: 'single_host_origin',
        revocationURL: 'https://accounts.google.com/o/oauth2/revoke?token=',
        /*
         * Policy about token renewal:
         * revocation: if the token is invalid the user is fordec to logout and warned.
         * manual_renovation: the user is warned about the token validity. Renewal is proposed.
         * automatic_renovation: the token is automatically renewed.
         */
        revocation: 'revocation',
        manual_renovation: 'manual_renovation',
        automatic_renovation: 'automatic_renovation',
        tokenRenewalPolicy: 'automatic_renovation'
    })

    /**
     * @ngdoc object
     * @name AUTHORIZATION_DATA
     * @module appverse.configuration.default
     * @description Defines default authorization and roles data
     */
    .constant('AUTHORIZATION_DATA', {
        roles: ['user', 'admin', 'editor'],
        adminRoles: ["ROLE_EXAMPLE", "ROLE_EXAMPLE_2", "ROLE_REMOTE_LOGGING_WRITER", "ROLE_USER"],
        users: ['Jesus de Diego'],
        userRoleMatrix: [{
            'user': 'Jesus de Diego',
            'roles': ["ROLE_EXAMPLE", "ROLE_EXAMPLE_2", "ROLE_REMOTE_LOGGING_WRITER", "ROLE_USER"]
        }, {
            'user': 'Antoine Charnoz',
            'roles': ["ROLE_EXAMPLE", "ROLE_EXAMPLE_2", "ROLE_REMOTE_LOGGING_WRITER", "ROLE_USER"]
        }],
        routesThatDontRequireAuth: ['/home'],
        routesThatRequireAdmin: ['/about']
    })


    /**
     * @ngdoc object
     * @name WEBSOCKETS_CONFIG
     * @module appverse.configuration.default
     * @description Configuration parameters for web sockets
     */
    .constant('WEBSOCKETS_CONFIG', {
        //        WS_URL: "ws://echo.websocket.org",
        WS_URL: "https://appverse.gftlabs.com/websockets/services/websocket/stats",
        WS_TYPE: 'auto', //auto|sockjs|native
        WS_PROTOCOL_TYPE: 'auto', //auto|stomp|none
        HEARTBEAT_OUTGOING: 20000, //in milliseconds
        HEARTBEAT_INCOMING: 0, //in milliseconds
        WS_CONNECTED: 'Websocket connected',
        WS_DISCONNECTED: 'Websocket disconnected',
        WS_CONNECTING: 'Connecting Websocket...',
        WS_CLOSED: 'Websocket connection closed',
        WS_CLOSING: 'Websocket connection closing...',
        WS_OPEN: 'Websocket connection is open',
        WS_UNKNOWN: 'Websocket status is unknown',
        WS_PROTOCOL_CONNECTED: 'Websocket protocol connected',
        WS_PROTOCOL_DISCONNECTED: 'Websocket protocol disconnected',
        WS_FAILED_CONNECTION: 'Failed to open a Websocket connection',
        WS_NOT_SUPPORTED: 'HTML5 Websockets specification is not supported in this browser.',
        WS_SUPPORTED: 'HTML5 Websockets specification is supported in this browser.'
    })

    /**
     * @ngdoc object
     * @name PERFORMANCE_CONFIG
     * @module appverse.configuration.default
     * @description Includes default information about the different facets for a better performance in the app.
     * There are three main sections: webworkers management, shadow dom objetc and High performance DOM directive.
     */
    .constant('PERFORMANCE_CONFIG', {
        /*
         * WEBWORKERS SECTION
         * To test multiple parallelized threads with web workers a thread pool or task queue is defined.
         * The goal is focused on using enough threads to improve the execution but not too much or the browser system can turn
         * into unstable.
         * You can configure the maximum number of concurrent web workers when this pool is instantiated,
         * and any 'task' you submit will be executed using one of the available threads from the pool.
         * Note that the app is not really pooling threads, but just using this pool to control the number of concurrently
         * executing web workers due to the high cost for start them.
         */
        /*
        Maximum number of simultaneous executing threads used by workers
         */
        webworker_pooled_threads: 4,
        /*
        If true, only workers in the web worker_authorized_workers property might be executed.
        Other invoked workers will not result in a worker call.
         */
        webworker_authorized_workers_only: true,
        /*
        Folder for workers' files
         */
        webworker_directory: "resources/webworkers/",
        /*
        List of authorized workers with its ID.
        The ID is used to be passed in the directive's attribute.
         */
        webworker_authorized_workers: [{
            'id': 'w1',
            'type': 'dedicated',
            'poolSize': 4,
            'file': 'RenderImage.js'
        }, {
            'id': 'w2',
            'type': 'dedicated',
            'poolSize': 4,
            'file': 'RestMultiRequest.js'
        }],
        webworker_dedicated_literal: "dedicated",
        webworker_shared_literal: "shared",
        webworker_Message_template: 'scripts/api/directives/webworkerMessage.html'
    })

    /**
     * @ngdoc object
     * @name ROUTER_CONFIG
     * @module appverse.configuration.default
     * @description Configuration for loading states at runtime
     */
    .constant('ROUTER_CONFIG', {
        loadStatesEnabled: false,
        autoLoadStates: true,
        statesUrl: '/states',
        prependBaseUrl: true,
        appendRequestSuffix: true,
    });
})();

/**
 * @ngdoc object
 * @name  AppInit
 * @module  appverse
 * @description
 * This file includes functionality to initialize settings in an appverse-web-html5 app
 * Just call the initalization code after having loaded angular and the configuration module:
 * <pre><code>AppInit.setConfig(settings).bootstrap();</code></pre>
 */
var AppInit = AppInit || (function(angular) {
    'use strict';

    loadConfig.$inject = ["ConfigLoaderProvider"];
    var
        settings,
        mainModuleName;

    /**
     * @ngdoc method
     * @name AppInit#setConfig
     * @param {object} settingsObject An object containing custom settings
     * @description Sets custom settings
     */
    function setConfig(settingsObject) {
        settings = settingsObject;
        var module = angular.module('appverse.configuration.loader');
        // Remove default config function
        module._invokeQueue.some(function(currentValue, index) {
            if (currentValue[0] === '$injector' && currentValue[1] === 'invoke') {
                module._invokeQueue.splice(index);
                return true;
            }
        });
        module.config(loadConfig);
        return AppInit;
    }

    /**
     * @ngdoc method
     * @name AppInit#bootstrap
     * @description Manually Bootstraps the application. For automatic bootstrap,
     * use the standard Angular way using the ng-app directive.
     *
     * @param {string} appMainModule The name of the main application module.
     * You can also use setMainModuleName and use this function without any parameters
     */
    function bootstrap(appMainModule) {
        var moduleName = appMainModule || mainModuleName;
        angular.element(document).ready(function() {
            angular.bootstrap(document, [moduleName]);
        });
    }

    /**
     * @ngdoc method
     * @name AppInit#setMainModuleName
     * @param {string} name The name of the main application module.
     */
    function setMainModuleName(name) {
        mainModuleName = name;
    }

    /**
     * @ngdoc method
     * @name AppInit#getMainModule
     * @return {string} The name of the main application module.
     */
    function getMainModule() {
        return angular.module(mainModuleName);
    }

    // ---- Privates -----

    function loadConfig(ConfigLoaderProvider) {
        ConfigLoaderProvider.load(settings);
    }

    return {
        setMainModuleName: setMainModuleName,
        setConfig: setConfig,
        bootstrap: bootstrap,
        getMainModule: getMainModule
    };

})(angular);
