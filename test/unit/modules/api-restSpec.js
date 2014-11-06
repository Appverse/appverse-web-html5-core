/*jshint expr:true */
"use strict";

describe('Unit: Testing AppREST module', function () {

    beforeEach(setupRestTesting);

    it('should contain a RESTFactory factory',
        inject(function (RESTFactory) {
            expect(RESTFactory).to.be.an.object;
        })
    );

    it('should contain a MulticastRESTFactory factory',
        inject(function (MulticastRESTFactory) {
            expect(MulticastRESTFactory).to.be.an.object;
        })
    );

    /////////////// HELPER FUNCTIONS

    function setupRestTesting() {

        // Generate mock modules and providers
        mockDependencies();

        // Load the module to be tested
        module("AppREST");
    }

    function mockDependencies() {

        // mock modules by creating empty ones
        angular.module('AppConfiguration', []);
        angular.module('AppSecurity', []);
        angular.module('AppCache', []);
        angular.module('restangular', []);

        // Provide the dependency injector with mock empty objects
        // instead of real ones
        module(function ($provide) {

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

            $provide.factory('CacheFactory', function() {
                return {};
            });

            $provide.factory('Oauth_RequestWrapper', function() {
                return {};
            });

            $provide.factory('Oauth_AccessToken', function() {
                return {};
            });

            $provide.constant('REST_CONFIG', {
                ElementTransformer : []
            });

            $provide.constant('SECURITY_GENERAL', {});
        });
    }
});
