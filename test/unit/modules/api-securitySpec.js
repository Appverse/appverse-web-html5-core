/*jshint expr:true */
"use strict";

describe('Unit: Testing AppSecurity module', function () {

    beforeEach(setupSecurityTesting);

    it('should contain a Oauth_Endpoint factory',
        inject(function (Oauth_Endpoint) {

            expect(Oauth_Endpoint).to.be.an.object;
        })
    );

    it('should contain a Oauth_AccessToken factory',
        inject(function (Oauth_AccessToken) {

            expect(Oauth_AccessToken).to.be.an.object;
        })
    );

    it('should contain a RoleService factory',
        inject(function (RoleService) {

            expect(RoleService).to.be.an.object;
        })
    );

    it('should contain a AuthenticationService factory',
        inject(function (AuthenticationService) {

            expect(AuthenticationService).to.be.an.object;
        })
    );


    /////////////// HELPER FUNCTIONS

    function setupSecurityTesting() {

        // Generate mock modules and providers
        mockDependencies();

        // Load the module to be tested
        module("AppSecurity");
    }

    function mockDependencies() {

        // Provide the dependency injector with mock empty objects
        // instead of real ones
        module(function ($provide) {
            $provide.service('AuthenticationService', function() {});
            $provide.service('RoleService', function() {});
            $provide.service('Oauth_AccessToken', function() {});
            $provide.service('Oauth_Endpoint', function() {});
        });
    }
});
