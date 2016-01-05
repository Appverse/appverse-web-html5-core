(function () {
    'use strict';

    angular.module('appverse.native')

    /**
     * @ngdoc service
     * @name AppverseNative
     * @module appverse.native
     * @description This module provides basic quick standard access to a Native functions
     */
    .run(function ($log, $q, Detection, $window, $timeout, $interval) {


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
    });
})();
