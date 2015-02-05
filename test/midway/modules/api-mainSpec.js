/*jshint expr:true */
'use strict';

describe('Midway: Api REST Module', function () {

    beforeEach(function() {
        setupMainTesting();
    });

    describe('when AppCache is loaded...', function() {

        beforeEach(function () {
            // create 'fake' security and config modules
            angular.module('AppConfiguration', []);

            module(function($provide) {
                $provide.value('RESTFactory', {
                    setCache : sinon.spy(),
                    enableDefaultContentType: sinon.spy(),
                });
            });

            module('AppCache');
        });

        it('should set an response interceptor to cache modules', inject(function(RESTFactory) {
            RESTFactory.setCache.called.should.be.true;
        }));
    });

    describe('when AppSecurity is NOT loaded...', function() {

        beforeEach(function () {
            angular.module('AppConfiguration', []);
            module('COMMONAPI');
        });

        beforeEach(module(function($provide) {
            $provide.constant('SECURITY_GENERAL', {
                securityEnabled : true, //should be irrelevant
            });

            $provide.value('Oauth_RequestWrapper', {
                wrapRequest : sinon.stub().returns(new RestangularMock()),
            });
        }));

        it('AppRest should NOT wrap requests with oauth', inject(function(Oauth_RequestWrapper) {
            Oauth_RequestWrapper.wrapRequest.called.should.be.false;
        }));

        it('RESTFactory should set default headers', inject(function(Restangular) {
            Restangular.setDefaultHeaders.called.should.be.true;
        }));

    });

    describe('when AppSecurity is loaded...', function() {

        beforeEach(function () {
            // create 'fake' security and config modules
            angular.module('AppSecurity', []);
            angular.module('AppConfiguration', []);
            module('COMMONAPI');
        });

        describe('and SECURITY_GENERAL.securityEnabled is true...', function() {

            beforeEach(module(function($provide) {
                $provide.constant('SECURITY_GENERAL', {
                    securityEnabled : true,
                });

                $provide.value('Oauth_RequestWrapper', {
                    wrapRequest : sinon.stub().returns(new RestangularMock()),
                });
            }));

            it('RESTFactory should wrap requests with oauth', inject(function(Oauth_RequestWrapper) {
                Oauth_RequestWrapper.wrapRequest.called.should.be.true;
            }));

            it('RESTFactory should NOT set default headers', inject(function(Restangular) {
                Restangular.setDefaultHeaders.called.should.be.false;
            }));

        });

        describe('when SECURITY_GENERAL.securityEnabled is false...', function() {

            beforeEach(module(function($provide) {
                $provide.constant('SECURITY_GENERAL', {
                    securityEnabled : false,
                });

                $provide.value('Oauth_RequestWrapper', {
                    wrapRequest : sinon.stub().returns(new RestangularMock()),
                });
            }));

            it('AppRest should NOT wrap requests with oauth', inject(function(Oauth_RequestWrapper) {
                Oauth_RequestWrapper.wrapRequest.called.should.be.false;
            }));

            it('RESTFactory should set default headers', inject(function(Restangular) {
                Restangular.setDefaultHeaders.called.should.be.true;
            }));

        });

    });


});


describe('REST_CONFIG.MockBackend is enabled...', function() {

    beforeEach(module(function($provide) {
        $provide.constant('REST_CONFIG', {
            ElementTransformer : [],
            MockBackend : true
        });
        $provide.constant('LOGGING_CONFIG', {});
        $provide.constant('PROJECT_DATA', {});
        $provide.constant('DETECTION_CONFIG', {});
        $provide.constant('CACHE_CONFIG', {});
        $provide.provider('ConfigLoader', function() {
            this.setDetection = sinon.spy();
            this.$get = sinon.spy();
        } );
        $provide.value('$httpBackend', {});
    }));

    beforeEach(module('COMMONAPI'));

    it('$httpBackend should be mocked', inject(function($httpBackend) {
        should.exist($httpBackend.whenGET);
    }));

});


describe('REST_CONFIG.MockBackend is DISABLED...', function() {

    beforeEach(module(function($provide) {
        $provide.constant('REST_CONFIG', {
            ElementTransformer : [],
            MockBackend : false
        });
        $provide.constant('LOGGING_CONFIG', {});
        $provide.constant('PROJECT_DATA', {});
        $provide.constant('DETECTION_CONFIG', {});
        $provide.constant('CACHE_CONFIG', {});
        $provide.provider('ConfigLoader', function() {
            this.setDetection = sinon.spy();
            this.$get = sinon.spy();
        } );
        $provide.value('$httpBackend', {});
    }));

    beforeEach(module('COMMONAPI'));

    it('$httpBackend should be mocked', inject(function($httpBackend) {
        should.not.exist($httpBackend.whenGET);
    }));

});


function setupMainTesting() {

    // First load the module
    module('AppREST');

    // then Override real services with mocks
    module(function($provide) {

        $provide.service('Restangular', RestangularMock);

        $provide.provider('ConfigLoader', function() {
            this.setDetection = sinon.spy();
            this.$get = function () {return this;};
        });

        $provide.constant('PROJECT_DATA', {});

        $provide.constant('DETECTION_CONFIG', {});

        $provide.constant('LOGGING_CONFIG', {});

        $provide.constant('CACHE_CONFIG', {});

        $provide.constant('SECURITY_GENERAL', {});

        $provide.constant('REST_CONFIG', {
            ElementTransformer : []
        });
    });
}

function RestangularMock() {
    this.setBaseUrl = sinon.spy();
    this.setExtraFields = sinon.spy();
    this.setParentless = sinon.spy();
    this.setOnElemRestangularized = sinon.spy();
    this.setResponseInterceptor = sinon.spy();
    this.setErrorInterceptor = sinon.spy();
    this.setRestangularFields = sinon.spy();
    this.setMethodOverriders = sinon.spy();
    this.setFullResponse = sinon.spy();
    this.setRequestSuffix = sinon.spy();
    this.setUseCannonicalId = sinon.spy();
    this.setEncodeIds = sinon.spy();
    this.setDefaultHeaders = sinon.spy();
}