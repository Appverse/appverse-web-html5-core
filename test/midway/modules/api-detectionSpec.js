/*jshint expr:true */
'use strict';

describe('Midway: Api Detection Module', function() {

    var Detection;

    beforeEach(function() {

        angular.module('AppConfiguration', []);

        module(function ($provide) {
            $provide.constant('PROJECT_DATA', {
                VendorLibrariesBaseUrl : 'bower_components'
            });
            $provide.constant('DETECTION_CONFIG', {
                mobileVendorLibraries : ['angular-touch/angular-touch.js']
            });
        });

        module('AppDetection');
    });

    describe('when the provider is injected', function() {

        beforeEach(inject(function(_Detection_) {
            Detection = _Detection_;
        }));

        it ('it should have identified whether AppverseMobile is present', function() {
            expect(Detection.hasAppverseMobile()).to.be.a('boolean');
        });

        it ('it should have identified whether the browser is mobile', function() {
            expect(Detection.isMobileBrowser()).to.be.a('boolean');
        });

    });

});