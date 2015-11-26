/*jshint expr:true, node:true */
'use strict';

describe('Unit: Api Detection Module', function () {

    describe('when browser is not mobile...', function () {

        beforeEach(function () {
            module('appverse.detection');
        });

        it('hasAppverseMobile property should be false', inject(function (Detection) {

            expect(Detection).to.be.defined;

            Detection.hasAppverseMobile().should.be.false;

        }));

        it('isMobileBrowser property should be false', inject(function (Detection) {

            expect(Detection).to.be.defined;

            Detection.isMobileBrowser().should.be.false;

        }));

    });

});
