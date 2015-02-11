(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.cache
     * @requires appverse.configuration
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
           var queryBuilder = CacheFactory.getIDBQueryBuilder();
           var objStore = CacheFactory.getIDBObjectStore();
           var myQuery = queryBuilder.$index(CACHE_CONFIG.IndexedDB_mainIndex).$gt(param).$asc.compile;
           objStore.each(myQuery).then(function(cursor){
               $scope.key = cursor.key;
               $scope.value = cursor.value;
           });
       }
      </code></pre>
     */

    angular.module('appverse.cache', ['ng', 'appverse.configuration', 'jmdobry.angular-cache', 'ngResource'])
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

})();
