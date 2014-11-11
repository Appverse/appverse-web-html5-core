/*jshint expr:true */

describe('Unit: Testing api-translate', function() { 'use strict';

    var translateProvider,
        dynamicLocaleProvider;

    beforeEach(setUpTranslateTesting);

    describe('when configuring module...', function() {

        it('configures the static files loader', function() {
            translateProvider.useStaticFilesLoader
                .calledWith({
                    prefix: 'resources/i18n/',
                    suffix: '.json'
                })
                .should.be.true;
        });

        it('configures the preferred language', function() {
            translateProvider.preferredLanguage
                .calledWith('en_US')
                .should.be.true;
        });

        it('configures the locale file route pattern', function() {
            dynamicLocaleProvider.localeLocationPattern
                .calledWith('resources/i18n/angular/angular-locale_{{locale}}.js')
                .should.be.true;
        });

    });

    describe('when translating with the service...', function() {

        it('should return the translated string if key exists', inject(function ($translate) {
          $translate('SALUTE').should.be.equal('Hello');
        }));

        it('should return the original string if key does not exist', inject(function ($translate) {
          $translate('not translated').should.be.equal('not translated');
        }));

    });

    describe('when translating with the directive...', function() {

        var $compile;
        var $rootScope;

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function(_$compile_, _$rootScope_){
          // The injector unwraps the underscores (_) from around the parameter names when matching
          $compile = _$compile_;
          $rootScope = _$rootScope_;
        }));

        it('should replace original text with translation', function() {
            // Compile a piece of HTML containing the directive
            var element = $compile("<p translate>SALUTE</p>")($rootScope);
            // fire all the watches, so text is evaluated
            $rootScope.$digest();
            // Check that the compiled element contains the templated content
            element.html().should.be.equal("Hello");
        });

        describe('when html contains an <i> tag...', function() {

            it('should translate the text and keep the <i> tag', function() {
                var element = $compile('<p translate><i class="icon"></i>SALUTE</p>')($rootScope);
                $rootScope.$digest();
                element.html().should.be.equal('<i class="icon"></i>Hello');
            });

        });

    });

    /////////////// HELPER FUNCTIONS

    /**
     * To be called in the beforeEach block
     */
    function setUpTranslateTesting() {

        // Generate mock modules and providers
        mockDependencies();

        // Load the module to be tested
        module('AppTranslate');

        // ...and trigger all the above
        inject();
    }

    /**
     * Creates mocks of dependencies.
     * Mocked functions are actually sinon spyies to check they have been called
     */
    function mockDependencies() {

        // AppConfiguration module mocked by creating it again
        angular.module('AppConfiguration', [])
            .constant('I18N_CONFIG', { PreferredLocale : 'en_US' });

        // Get reference to providers.
        // Providers cannot be mocked using $provide like services or factories as they are not
        // available after config phase, therefore they cannot be injected with inject().
        // However, we can get their objects using a module() block.
        module('pascalprecht.translate', function($translateProvider) {
            $translateProvider.useStaticFilesLoader = sinon.spy();
            $translateProvider.preferredLanguage = sinon.spy();
            $translateProvider.translations({'SALUTE' : 'Hello'});
            translateProvider = $translateProvider;
        });
        module('tmh.dynamicLocale', function(tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider.localeLocationPattern = sinon.spy();
            dynamicLocaleProvider = tmhDynamicLocaleProvider;
        });
    }

});



