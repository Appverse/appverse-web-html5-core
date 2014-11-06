/*jshint expr:true */
"use strict";

describe('Unit: Testing AppCache module', function () {

    beforeEach(setupCacheTesting);

    it('should contain a CacheFactory factory', inject(function (CacheFactory) {
        expect(CacheFactory).to.be.an.object;
    }));

    it('should contain a IDBService service',
        inject(function (IDBService) {
            expect(IDBService).to.be.an.object;
            expect(IDBService.isSupported()).to.be.false;
        })
    );

    /////////////// HELPER FUNCTIONS

    function setupCacheTesting() {

        // Generate mock modules and providers
        mockDependencies();

        // Load the module to be tested
        module("AppCache");
    }

    function mockDependencies() {

        // mock modules by creating empty ones
        angular.module('AppConfiguration', []);
        angular.module('jmdobry.angular-cache', []);

        // Provide the dependency injector with mock empty objects
        // instead of real ones
        module(function ($provide) {

            $provide.factory('$angularCacheFactory', function(){
                return {};
            });

            $provide.constant('CACHE_CONFIG', {});
        });
    }
});
