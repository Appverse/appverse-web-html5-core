/*jshint expr:true */
'use strict';

describe('Midway: Api Main Module', function () {

    describe('when AppREST is loaded...', function() {

        beforeEach(function() {
            setupRestTesting();
        });

        describe('and AppSecurity is NOT loaded...', function() {

            beforeEach(function () {
                angular.module('AppConfiguration', []);
                module('COMMONAPI');
            });

            beforeEach(module(function($provide) {
                $provide.constant('SECURITY_GENERAL', {
                    securityEnabled : true, //should be irrelevant
                });

                $provide.value('Oauth_RequestWrapper', {
                    wrapRequest : sinon.spy(),
                });
            }));

            it('AppRest should NOT wrap requests with oauth', inject(function(Oauth_RequestWrapper) {
                    Oauth_RequestWrapper.wrapRequest.called.should.be.false;
            }));

            it('RESTFactory should set default headers', inject(function(Restangular) {
                Restangular.setDefaultHeaders.called.should.be.true;
            }));

        });

        describe('and AppSecurity is loaded...', function() {

            beforeEach(function () {
                // create 'fake' security module
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
                        wrapRequest : sinon.spy(),
                    });
                }));

                it('RESTFactory should wrap requests with oauth', inject(function(Oauth_RequestWrapper) {
                    Oauth_RequestWrapper.wrapRequest.called.should.be.true;
                }));

                it('RESTFactory should NOT set default headers', inject(function(Restangular) {
                    Restangular.setDefaultHeaders.called.should.be.false;
                }));

            });

            describe('and SECURITY_GENERAL.securityEnabled is false...', function() {

                beforeEach(module(function($provide) {
                    $provide.constant('SECURITY_GENERAL', {
                        securityEnabled : false,
                    });

                    $provide.value('Oauth_RequestWrapper', {
                        wrapRequest : sinon.spy(),
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



});


function setupRestTesting() {

    // First load the module
    module('AppREST');

    // then Override real services with mocks
    module(function($provide) {

        $provide.service('Restangular', function() {
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
        });

        $provide.constant('LOGGING_CONFIG', {});

        $provide.constant('CACHE_CONFIG', {});

        $provide.constant('REST_CONFIG', {
            ElementTransformer : []
        });
    });



}