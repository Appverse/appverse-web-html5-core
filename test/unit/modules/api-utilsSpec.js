/*jshint expr:true */
"use strict";

describe('Unit: Testing moduleSeeker ', function () {

    var moduleSeeker;

    beforeEach('register the module', module('appverse.utils'));

    beforeEach('inject ModuleSeeker', inject(function(ModuleSeeker) {
        moduleSeeker = ModuleSeeker;
    }));

    describe('when a module does not exist...', function() {

        it('should return false', function() {
            moduleSeeker.exists('nonExistingModule').should.be.false;
        });

    });

    describe('when a module exists...', function() {

        it('should return true', function() {
            moduleSeeker.exists('appverse.utils').should.be.true;
        });

    });

});


describe('Unit: Testing Relative URL generator ', function () {

    describe('when adding a base URL to a relative URLS...', function() {

        var BaseUrlSetter;

        beforeEach('register the module', module('appverse.utils'));

        beforeEach('inject BaseUrlSetter', inject(function(_BaseUrlSetter_) {
            BaseUrlSetter = _BaseUrlSetter_;
        }));

        describe('when base URL does not have trailing slash', function() {

            var url = 'mypath.html',
            baseUrl = '/a/base/url';

            it('should return the complete URL as the concatenation of both URLS', function() {

                BaseUrlSetter
                    .setBasePath(baseUrl)
                    .inUrl(url)
                    .should.equal('/a/base/url/mypath.html');
            });

        });

        describe('when base URL has trailing slash', function() {

            var url = 'mypath.html',
            baseUrl = '/a/base/url/';

            it('should return the complete URL as the concatenation of both URLS', function() {

                BaseUrlSetter
                    .setBasePath(baseUrl)
                    .inUrl(url)
                    .should.equal('/a/base/url/mypath.html');
            });

        });

        describe('when base URL has trailing slash and other URL too', function() {

            var url = '/mypath.html',
            baseUrl = '/a/base/url/';

            it('should return the complete URL as the concatenation of both URLS', function() {

                BaseUrlSetter
                    .setBasePath(baseUrl)
                    .inUrl(url)
                    .should.equal('/a/base/url/mypath.html');
            });

        });

        describe('when URL have extra  spaces', function() {

            var url = ' /mypath.html',
            baseUrl = '/a/base/url/  ';

            it('should return the complete URL as the concatenation of both URLS', function() {

                BaseUrlSetter
                    .setBasePath(baseUrl)
                    .inUrl(url)
                    .should.equal('/a/base/url/mypath.html');
            });

        });

    });



});