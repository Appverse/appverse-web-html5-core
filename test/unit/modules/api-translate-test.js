describe('api-translate Tests', function() { 'use strict';

    var translateProvider,
        dynamicLocaleProvider;

    beforeEach(setUpTranslateTesting);

    describe('when configuring module...', function() {

        it('configures the static files loader', function() {
            expect(translateProvider.useStaticFilesLoader).toHaveBeenCalledWith({
                prefix: 'resources/i18n/',
                suffix: '.json'
            });
        });

        it('configures the preferred language', function() {
            expect(translateProvider.preferredLanguage).toHaveBeenCalledWith('en_US');
        });

        it('configures the locale file route pattern', function() {
            expect(dynamicLocaleProvider.localeLocationPattern)
                .toHaveBeenCalledWith('resources/i18n/angular/angular-locale_{{locale}}.js');
        });

    });

    describe('when translating with the service...', function() {

        it('should return the translated string if key exists', inject(function ($translate) {
          expect($translate('SALUTE')).toBe('Hello');
        }));

        it('should return the original string if key does not exist', inject(function ($translate) {
          expect($translate('not translated')).toBe('not translated');
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
            expect(element.html()).toBe("Hello");
        });

        describe('when html contains an <i> tag...', function() {

            it('should translate the text and keep the <i> tag', function() {
                var element = $compile('<p translate><i class="icon"></i>SALUTE</p>')($rootScope);
                $rootScope.$digest();
                expect(element.html()).toBe('<i class="icon"></i>Hello');
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
     * Mocked functions are actually jasmine spyies to check they have been called
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
            $translateProvider.useStaticFilesLoader = jasmine.createSpy('useStaticFilesLoader');
            $translateProvider.preferredLanguage = jasmine.createSpy('preferredLanguage');
            $translateProvider.translations({'SALUTE' : 'Hello'});
            translateProvider = $translateProvider;
        });
        module('tmh.dynamicLocale', function(tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider
                .localeLocationPattern = jasmine.createSpy('localeLocationPattern');
            dynamicLocaleProvider = tmhDynamicLocaleProvider;
        });
    }

});



