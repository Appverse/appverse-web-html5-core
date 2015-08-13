(function () {
    'use strict';

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
    }

})();