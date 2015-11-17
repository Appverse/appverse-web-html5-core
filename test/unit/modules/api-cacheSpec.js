/*jshint expr:true, node:true */
"use strict";

describe('Unit: Testing appverse.cache module', function () {

    beforeEach(module('appverse.cache'));

    it('should contain a avCacheFactory factory', inject(function (avCacheFactory) {
        expect(avCacheFactory).to.be.an.object;
    }));

    it('should contain a IDBService service',
        inject(function (IDBService) {
            expect(IDBService).to.be.an.object;
            expect(IDBService.isSupported()).to.be.false;
        })
    );

});
