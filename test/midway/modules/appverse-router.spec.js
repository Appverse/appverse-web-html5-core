/*jshint expr:true */
describe('Midway: Api Route Module', function () { 'use strict';

    var module,
            deps;

    var hasModule = function (m) {
        return deps.indexOf(m) >= 0;
    };

    beforeEach(function () {
        module = angular.module('appverse.router');
        deps = module.value('appverse.router').requires;
    });

    it('should be registered', function () {
        expect(module).not.to.be.null;
    });

    it('should have angular dependency', function () {
        hasModule('ui.router').should.be.true;
    });

});