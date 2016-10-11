/*jshint expr:true, node:true */
"use strict";

describe('Unit: Testing appverse.native module', function () {

    var $httpBackend, $httpProvider;

    beforeEach(function () {

        window.Appverse = {
            Geo: {
                IsGPSEnabled: function () {
                    window.callbackGeo({});
                },
                StartUpdatingLocation: function (callback) {
                    window[callback]({});
                },
                GetCoordinates: function (callback) {
                    window[callback]({
                        XCoordinate: 1
                    });
                },
                StopUpdatingLocation: function () {}
            },
            Net: {
                IsNetworkReachable: function (url, callback) {
                    window[callback]({});
                }
            },
            IO: {
                serviceName: 'io'
            },
            is: {
                iOS: false
            },
            SERVICE_URI: '/service/'
        };

        window.AppverseEmulator = {};
        window._AppverseContext = {};
        window.get_params = function () {};
        module(function ($provide) {

            $provide.constant('IONIC_CONFIG', {
                "suffix" : "-mobile"
            });
        });
        module('appverse.native');

        AppInit.setConfig({
            environment: {
                REST_CONFIG: {
                    BaseUrl: '/api',
                    HostList: [{
                        Host: ''
                    }]
                }
            }
        });

    });

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $httpProvider = $injector.get('$http');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get the location', function (done) {

        inject(function ($rootScope) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (Position) {
                    expect(Position).to.be.an.object;
                    expect(Position.coords.latitude).to.be.equal(1);
                    done();
                });
                $rootScope.$apply();
            } else {
                done();
            }
        });
    });

    it('should watch the location and clear', function (done) {

        inject(function ($rootScope, $interval) {
            if (navigator.geolocation) {
                var id = navigator.geolocation.watchPosition(function (Position) {
                    expect(Position).to.be.an.object;
                    expect(Position.coords.latitude).to.be.equal(1);
                    done();
                });
                $interval.flush(1000);
                navigator.geolocation.clearWatch(id);
            } else {
                done();
            }
        });
    });

    it('should get access denied to location', function (done) {

        window.Appverse.Geo.GetCoordinates = function () {};

        inject(function ($rootScope) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function () {

                }, function (PositionError) {
                    expect(PositionError).to.be.an.object;
                    expect(PositionError.code).to.be.equal(1);
                    done();
                });
                window.onAccessToLocationDenied();
                $rootScope.$apply();
            } else {
                done();
            }
        });
    });

    it('should get position unavailable', function (done) {

        window.Appverse.Geo.GetCoordinates = function (callback) {
            window[callback]();
        };

        inject(function ($rootScope) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function () {

                }, function (PositionError) {
                    expect(PositionError).to.be.an.object;
                    expect(PositionError.code).to.be.equal(2);
                    done();
                });
                $rootScope.$apply();
            } else {
                done();
            }
        });
    });

    it('should get position timeout', function (done) {

        window.Appverse.Geo.GetCoordinates = function () {};

        inject(function ($rootScope, $timeout) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function () {

                }, function (PositionError) {
                    expect(PositionError).to.be.an.object;
                    expect(PositionError.code).to.be.equal(3);
                    done();
                }, {
                    timeout: 1000
                });
                $timeout.flush();
            } else {
                done();
            }
        });
    });

    it('should be online', function () {

        inject(function ($rootScope, Detection) {
            $rootScope.$apply();
            expect(Detection.isOnline).to.be.true;
        });
    });

    it('should be offline', function () {

        window.Appverse.Net.IsNetworkReachable = function (url, callback) {
            window[callback]();
        };

        inject(function ($rootScope, Detection) {
            window.onConnectivityChange();
            $rootScope.$apply();
            expect(Detection.isOnline).to.be.false;
        });
    });

    it('should send an HTTP GET request and cache the second request', function (done) {

        inject(function ($http) {

            expect($http.defaults.cache).to.be.an.object;

            $http.defaults.cache.removeAll(); //Needed if running karma with autoWatch:true

            $httpBackend.whenPOST('/service/io/InvokeService').respond(200);

            $http.get('/api/test', {
                cache: true
            }).then(function (response) {
                expect(response.config.method).to.equal('GET');
                expect(response.headers()).to.be.object;
                expect(response.headers('Content-Type')).to.equal('application/json');
                expect(response.data).to.deep.equal({});
            });

            $httpBackend.flush();

            window.$httpCallback({
                Content: '{}',
                Headers: [{
                    Name: 'Content-Type',
                    Value: 'application/json'
                }]
            }, '1');

            $http.get('/api/test', {
                cache: true
            }).then(function (response) {
                expect(response.config).to.be.object;
                expect(response.headers()).to.be.object;
                expect(response.headers('Content-Type')).to.equal('application/json');
                expect(response.data).to.deep.equal({});
                done();
            });

            $httpBackend.flush();
        });
    });

});
