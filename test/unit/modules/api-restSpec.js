/*jshint expr:true */
"use strict";

describe('Unit: Testing appverse.rest module', function () {

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

    describe('when wrapping request in the Rest Service', function() {

        // Create a mock wrapper that wraps requests by just
        // setting a variable in the restangular object
        var wrapper = {
            wrapRequest: function (restangularService) {
                restangularService.wrapped = true;
                return restangularService;
            }
        };

        it('should return the processed Restangular service', inject(function(RESTFactory, Restangular) {
            expect(Restangular.wrapped).to.not.exist;
            RESTFactory.wrapRequestsWith(wrapper);
            Restangular.wrapped.should.be.true;
        }));

    });

    describe('when enabling default content type', function() {

        it('Restangular should set default headers', inject(function(RESTFactory, Restangular) {
            RESTFactory.enableDefaultContentType();
            Restangular.setDefaultHeaders.calledWith({'Content-Type': 'text/plain;'}).should.be.true;
        }));

    });

    describe('when testing a directive...', function () {

        var $rootScope;

        describe('when request is not resolved yet...', function() {

            it("loading state should be true", inject(function($compile, $rootScope) {
                // Compile a piece of HTML containing the directive
                $compile('<div rest rest-path="data/books.json" rest-name="mybooks">')($rootScope);

                // Check that the compiled element contains the templated content
                $rootScope.mybooksLoading.should.be.true;
            }));

        });

        describe('when request is resolved with success..', function() {

            beforeEach('mock RESTFactory to return success', module(function($provide) {
                $provide.service('RESTFactory', function() {
                    this.enableDefaultContentType = sinon.spy();
                    this.setCache = sinon.spy();
                    this.readObject = function(path, success) {
                        success({books: 'mock'});
                    };
                });
            }));

            beforeEach('compile directive and fire watches', inject(function($compile, _$rootScope_) {
                $rootScope = _$rootScope_;
                // Compile a piece of HTML containing the directive
                $compile('<div rest rest-path="data/books.json" rest-name="mybooks">')($rootScope);
                // fire all the watches, so text is evaluated
                $rootScope.$digest();
            }));

            it("should load data into a scope variable", function() {
                $rootScope.mybooks.should.be.eql({books: 'mock'});
            });

            it("loading state should be true when the request is not resolved yet", function() {
                $rootScope.mybooksLoading.should.be.false;
            });

        });

        describe('when request is resolved with error..', function() {

            beforeEach('mock RESTFactory to return error', module(function($provide) {
                $provide.service('RESTFactory', function() {
                    this.enableDefaultContentType = sinon.spy();
                    this.setCache = sinon.spy();
                    this.readObject = function(path, success, error) {
                        error();
                    };
                });
            }));

            beforeEach('compile directive and fire watches', inject(function($compile, _$rootScope_) {
                $rootScope = _$rootScope_;
                // Compile a piece of HTML containing the directive
                $compile('<div rest rest-path="data/books.json" rest-name="mybooks">')($rootScope);
                // fire all the watches, so text is evaluated
                $rootScope.$digest();
            }));

            it("should set error state to true", inject(function($compile, $rootScope) {
                $rootScope.mybooksError.should.be.true;
            }));

            it("loading state should be true when the request is not resolved yet",
                inject(function($compile, $rootScope) {
                    $rootScope.mybooksLoading.should.be.false;
                })
            );

        });

    });


    /////////////// HELPER FUNCTIONS

    function setupRestTesting() {

        // Generate mock modules and providers
        mockDependencies();

        // Load the module to be tested
        module("appverse.rest");
    }

    function mockDependencies() {

        // mock modules by creating empty ones
        angular.module('AppConfiguration', []);
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
                return {
                    getHttpCache : sinon.stub()
                };
            });

            $provide.factory('Oauth_RequestWrapper', function() {
                return {};
            });

            $provide.factory('Oauth_AccessToken', function() {
                return {};
            });

            $provide.constant('REST_CONFIG', {
                ElementTransformer : [],
                DefaultContentType: 'text/plain;'
            });

            $provide.constant('SECURITY_GENERAL', {});
        });
    }
});
