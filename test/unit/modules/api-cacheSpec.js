/*jshint expr:true, node:true */
"use strict";

describe('Unit: Testing appverse.cache module', function() {

    var idb, rootScope;

    beforeEach(module('appverse.cache'));
    beforeEach(inject(function(IDBService, $rootScope) {
        idb = IDBService;
        rootScope = $rootScope;
    }));

    it('should contain a avCacheFactory factory', inject(function(avCacheFactory) {
        expect(avCacheFactory).to.be.an.object;
    }));

    it('should contain a IDBService service', function() {
        expect(idb).to.be.an.object;
        expect(idb.item()).to.be.an.object;
        expect(idb.isSupported()).to.be.true;
        expect(idb.ready()).to.be.false;
        expect(idb.getDefaults()).to.be.a.promise;
    });

});
