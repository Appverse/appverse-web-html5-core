(function() {
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
     * @requires $q
     * @requires $log
     */
    .service('IDBService', ['$q', '$log', function($q, $log) {
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
         * @name IDBService#isSupported
         * @description Returns true if the browser supports the Indexed DB HTML5 spec.
         */
        service.isSupported = function() {
            return ("indexedDB" in window);
        };

        /**
         * @ngdoc method
         * @name IDBService#deleteDefault
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
         * @name IDBService#getDefault
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
         * @name IDBService#getDefaults
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
         * @name IDBService#ready
         * @description This flag is true if the IDB has been successfully initializated.
         */
        service.ready = function() {
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
         * @name IDBService#item
         *
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
