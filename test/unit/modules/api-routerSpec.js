/*jshint expr:true, node:true */
"use strict";

describe('Unit: Testing appverse.router module', function() {

    var $httpBackend;

    beforeEach(module('appverse.router'));

    AppInit.setConfig({
        environment: {
            ROUTER_CONFIG: {
                loadStatesEnabled: true
            }
        }
    });

    beforeEach(inject(function(_$httpBackend_) {
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should contain a dynamicStates provider', inject(function(avStates, $state) {

        $httpBackend.when('GET', '/api/states.json')
            .respond([{
                "name": "home",
                "config": {
                    "url": "/home",
                    "templateUrl": "home.html"
                }
            }]);

        expect(avStates).to.be.an.object;

        $httpBackend.flush();

        expect($state.get('home')).to.be.not.null;
    }));

});
