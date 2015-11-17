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
