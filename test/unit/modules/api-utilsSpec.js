/*jshint expr:true */
"use strict";

describe('Unit: Testing moduleSeeker ', function () {

    var moduleSeeker;

    beforeEach('register the module', module('AppUtils'));

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
            moduleSeeker.exists('AppUtils').should.be.true;
        });

    });

});