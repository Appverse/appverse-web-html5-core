/*jshint expr:true */
'use strict';

describe('Unit: Api Detection Module', function() {

    var DetectionProvider;
    var Detection;

/*
    describe('when browser is not mobile...', function() {

        beforeEach('inject mocks', function () {

            var mocks = {

                MobileDetector : {
                    hasAppverseMobile : function() {
                        return false;
                    },
                    isMobileBrowser : function() {
                        return false;
                    }
                },

                LibrariesLoader : {},
            };

            setupDetectionProviderTesting(mocks);

        });

        it ('hasAppverseMobile property should be false', function() {

           expect(DetectionProvider).to.not.be.undefined;

           Detection.hasAppverseMobile.should.be.false;

        });

        it ('isMobileBrowser property should be false', function() {

           expect(DetectionProvider).to.not.be.undefined;

           Detection.isMobileBrowser.should.be.false;

        });

    });

    describe('when appverseMobile is present...', function() {

        beforeEach('inject mocks', function () {

            var mocks = {

                MobileDetector : {
                    hasAppverseMobile : function() {
                        return true;
                    },
                    isMobileBrowser : function() {
                        return false;
                    }
                },

                LibrariesLoader : {
                    load: sinon.spy()
                },
            };

            setupDetectionProviderTesting(mocks);

        });

        it ('hasAppverseMobile property should be true', function() {

            Detection.hasAppverseMobile.should.be.true;

        });

        it ('mobile libraries should be loaded', function() {

            Detection.mobileLibrariesLoader.load.called.should.be.true;

        });

    });


    describe('when mobileBrowser is present...', function() {

        beforeEach('inject mocks', function () {

            var mocks = {

                MobileDetector : {
                    hasAppverseMobile : function() {
                        return false;
                    },
                    isMobileBrowser : function() {
                        return true;
                    }
                },

                LibrariesLoader : {
                    load: sinon.spy()
                },
            };

            setupDetectionProviderTesting(mocks);

        });

        it ('isMobileBrowser property should be true', function() {

            Detection.isMobileBrowser.should.be.true;

        });

        it ('mobile libraries should be loaded', function() {

            Detection.mobileLibrariesLoader.load.called.should.be.true;

        });

    });
*/

    /////////////// HELPER FUNCTIONS


    function setupDetectionProviderTesting(mocks) {

        // add config loader to mocks it not previously defined
        var mockConfigLoader = {};
        mockConfigLoader.fromUrl = sinon.stub().returns(mockConfigLoader);
        mockConfigLoader.loadFromJsonInto = sinon.spy();
        mocks.ConfigLoader = mocks.ConfigLoader || mockConfigLoader;

        // Configure the service provider
        // by injecting it to a fake module's config block
        angular.module('fakeModule', [])
        .config( function (_DetectionProvider_) {
            DetectionProvider = _DetectionProvider_;
        });

        // angularLoad module mocked by creating it again
        angular.module('angularLoad', []);

        // Initialize injector for the real and fake modules
        module('AppDetection', 'fakeModule');

        module(function($provide){
            $provide.factory('MobileLibrariesLoader', function(){
                return mocks.LibrariesLoader;
            });
            $provide.factory('MobileDetector', function(){
                return mocks.MobileDetector;
            });
            $provide.factory('ConfigLoader', function(){
                return mocks.ConfigLoader;
            });
        });

        // Kickstart the injector
        // and get reference to the Detection Service
        inject(function(MobileLibrariesLoader, MobileDetector, ConfigLoader) {
            Detection = DetectionProvider.$get(MobileLibrariesLoader, MobileDetector, ConfigLoader);
        });
    }



});