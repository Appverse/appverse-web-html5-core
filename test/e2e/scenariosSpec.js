'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Appverse Web Html5 core App', function() {

    beforeEach(function() {
        browser.get('/');
    });

    describe('when browser is not mobile', function() {

        it('a text should indicate it', function() {
            var text = element(by.css('#mobileBrowser')).getText();
            expect(text).toBe('no');
        });
    });

    describe('when appverseMobile is not present', function() {

        it('a text should indicate it', function() {
            var text = element(by.css('#appverseMobile')).getText();
            expect(text).toBe('no');
        });
    });

});
