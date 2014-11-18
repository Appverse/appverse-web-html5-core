/*jshint expr:true */
'use strict';

describe('Unit: Api Detection Module', function() {

    var DetectionProvider;
    var Detection;


    describe('when browser is not mobile...', function() {

        beforeEach('inject mocks', function () {

            var mocks = {

                MobileDetector : function() {
                    this.hasAppverseMobile = function() {
                        return false;
                    };
                    this.isMobileBrowser = function() {
                        return false;
                    };
                    this.$get = function() { return this;};
                },

                LibrariesLoader : function() {
                    this.$get = function() { return this;};
                },
            };

            setupDetectionProviderTesting(mocks);

        });

        it ('hasAppverseMobile property should be false', function() {

           expect(DetectionProvider).to.not.be.undefined;

           Detection.hasAppverseMobile().should.be.false;

        });

        it ('isMobileBrowser property should be false', function() {

           expect(DetectionProvider).to.not.be.undefined;

           Detection.isMobileBrowser().should.be.false;

        });

    });

    describe('when appverseMobile is present...', function() {

        beforeEach('inject mocks', function () {

            var mocks = {

                MobileDetector : function() {
                    this.hasAppverseMobile = function() {
                        return true;
                    };
                    this.isMobileBrowser = function() {
                        return false;
                    };

                    this.$get = function() { return this;};
                },

                LibrariesLoader : function() {
                    this.load = sinon.spy();
                    this.$get = function() { return this;};
                },
            };

            setupDetectionProviderTesting(mocks);

        });

        it ('hasAppverseMobile() should be true', function() {

            DetectionProvider.hasAppverseMobile().should.be.true;

        });

        it ('mobile libraries should be loaded', function() {

            DetectionProvider.mobileLibrariesLoader.load.called.should.be.true;

        });

    });


    describe('when mobileBrowser is present...', function() {

        beforeEach('inject mocks', function () {

            var mocks = {

                MobileDetector : function() {
                    this.hasAppverseMobile = function() {
                        return false;
                    };
                    this.isMobileBrowser = function() {
                        return true;
                    };

                    this.$get = function() { return this;};
                },

                LibrariesLoader : function() {
                    this.load = sinon.spy();
                    this.$get = function() { return this;};
                },
            };

            setupDetectionProviderTesting(mocks);

        });

        it ('isMobileBrowser property should be true', function() {

            Detection.isMobileBrowser().should.be.true;

        });

        it ('mobile libraries should be loaded', function() {

            Detection.mobileLibrariesLoader.load.called.should.be.true;

        });

    });


    /////////////// HELPER FUNCTIONS

    function setupDetectionProviderTesting(mocks) {
        // Configure the service provider
        // by injecting it to a fake module's config block
        angular.module('fakeModule', [])
        .config( function (_DetectionProvider_) {
            DetectionProvider = _DetectionProvider_;
        });

        // Manually mock providers by overriding them in the invokeQueue
        // Each item in the queue is an array with three elements.
        // The first is the provider that will invoke the service,
        // the second is the method on the provider to use
        // and the third element is an array of any arguments passed to the service.
        var AppDetection = angular.module('AppDetection');
        AppDetection._invokeQueue[1][2][1] = mocks.MobileDetector;
        AppDetection._invokeQueue[0][2][1] = mocks.LibrariesLoader;

        // Initialize injector for the real and fake modules
        module('AppDetection','fakeModule');

        // Kickstart the injector
        // and get reference to the Detection Service
        inject(function() {
            Detection = DetectionProvider.$get();
        });
    }

});