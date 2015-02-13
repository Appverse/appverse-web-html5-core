(function () {
    'use strict';

    angular.module('AppDetection')
        .provider('Detection', DetectionProvider);

    /**
     * @ngdoc provider
     * @name AppDetection.provider:Detection
     * @description
     * Contains methods for browser and network detection.
     */
    function DetectionProvider(MobileDetectorProvider) {
        this.mobileDetector = MobileDetectorProvider;
        this.bandwidth = 0;
        this.isPollingBandwidth = false;
        // Injected when the detection service is created
        this.$http = undefined;

        // Get the service
        this.$get = function ($http) {
            this.$http = $http;
            return this;
        };

        this.hasAppverseMobile = function () {
            return this.mobileDetector.hasAppverseMobile();
        };

        this.isMobileBrowser = function () {
            return this.mobileDetector.isMobileBrowser();
        };

        // Do some initialization
        if (this.hasAppverseMobile() || this.isMobileBrowser()) {
            // Do something for mobile...
        }

        var fireEvent = function (name, data) {
            var e = document.createEvent("Event");
            e.initEvent(name, true, true);
            e.data = data;
            window.dispatchEvent(e);
        };

        var fetch = function (url, callback) {
            var xhr = new XMLHttpRequest();

            var noResponseTimer = setTimeout(function () {
                xhr.abort();
                fireEvent("connectiontimeout", {});
            }, 5000);

            xhr.onreadystatechange = function () {
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
         * @name AppDetection.provider:Detection#testOnlineStatus
         * @methodOf AppDetection.provider:Detection
         * @param {String} path The item URL
         * @description Tries to fetch a file on the server and fire events for fail and success.
         */
        this.testOnlineStatus = function () {
            fetch("resources/detection/ping.json");
        };

        /**
         * @ngdoc method
         * @name AppDetection.provider:Detection#startPollingOnlineStatus
         * @methodOf AppDetection.provider:Detection
         * @param {number} interval Time in milliseconds
         * @description Tries to fetch a file on the server at regular intervals and fire events for fail and success.
         */
        this.startPollingOnlineStatus = function (interval) {
            this.isPollingOnlineStatus = setInterval(this.testOnlineStatus, interval);
        };

        this.stopPollingOnlineStatus = function () {
            clearInterval(this.isPollingOnlineStatus);
            this.isPollingOnlineStatus = false;
        };

        this.testBandwidth = function () {
            var jsonUrl = "resources/detection/bandwidth.json?bust=" + (new Date()).getTime();
            fireEvent("onBandwidthStart");
            this.$http.get(jsonUrl).success(function (data, status, headersFn) {
                fireEvent("onBandwidthEnd", {
                    status: status,
                    data: data,
                    getResponseHeader: headersFn
                });
            });
        };

        this.startPollingBandwidth = function (interval) {
            this.testBandwidth();
            this.isPollingBandwidth = setInterval(this.testBandwidth.bind(this), interval);
        };

        this.stopPollingBandwidth = function () {
            clearInterval(this.isPollingBandwidth);
            this.isPollingBandwidth = false;
        };
    }


})();
