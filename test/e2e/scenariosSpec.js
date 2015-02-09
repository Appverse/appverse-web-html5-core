'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Appverse Web Html5 core App', function() {


    describe('When view is detection', function() {

        beforeEach(function() {
            browser.get('#detection');
        });

        describe('and browser is not mobile', function() {

            it('a text should indicate it', function() {
                var text = element(by.css('#mobileBrowser')).getText();
                expect(text).toBe('no');
            });
        });

        describe('and appverseMobile is not present', function() {

            it('a text should indicate it', function() {
                var text = element(by.css('#appverseMobile')).getText();
                expect(text).toBe('no');
            });
        });


        describe('and checking bandwith', function() {

            beforeEach(function(done) {
                element(by.css('#bandwidthStartBtn')).click();
                setTimeout(function() {
                    element(by.css('#bandwidthStopBtn')).click();
                    done();
                }, 1000);
            });

            it('should show a numeric value', function() {
                var bandwith = element(by.css('#bandwidthValue')).getText();
                expect(bandwith).toMatch(/\d{1,}/);
            });

        });

    });

    describe('when retrieving the already cached "Rosetta" word', function() {

        beforeEach(function() {
            browser.get('#cache');
        });

        it('should show "Rosetta"', function() {
            var text = element(by.css('#cachedValue')).getText();
            expect(text).toBe('Rosetta');
        });

    });

    describe('when loading a page with a translated welcome message', function() {

        beforeEach(function() {
            browser.get('#i18n');
        });

        it('translation should be shown', function() {
            var text = element(by.css('#translation')).getText();
            expect(text).toMatch(/Welcome [a-z]+, you are \d{1,3} year\(s\) old!/i);
        });

    });

    describe('when clicking in performance test with 4 threads', function() {

        beforeEach(function() {
            browser.get('#performance');
        });

        beforeEach(function() {
            element(by.cssContainingText('#poolSize option', 'Four Threads')).click();
            element(by.css('#performanceBtn')).click();
        });

        it('translation should be shown', function() {
            var canvas = element(by.css('#targetCanvas')).getText();
            expect(canvas).not.toBe(null);
        });

    });

    describe('when getting Rest data', function() {

        beforeEach(function() {
            browser.get('#rest');
        });

        it('some data has been loaded and shown', function() {
            expect(element.all(by.repeater('book in mybooks')).count()).toBeGreaterThan(0);
        });

    });

    describe('when navigating to /#websockets', function() {

        beforeEach(function() {
            browser.get('#websockets');
        });

        it('should have a chart container', function() {
            var chartContainer = element(by.css('#chartContainer'));
            expect(chartContainer).not.toBeUndefined();
        });

    });

});
