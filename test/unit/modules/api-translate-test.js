describe('api-translate Test', function() { 'use strict';

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
            expect(dynamicLocaleProvider.localeLocationPattern).toHaveBeenCalledWith('resources/i18n/angular/angular-locale_{{locale}}.js');
        });

    });

    describe('when translating...', function() {

        it('should be defined', inject(function ($translate) {
          expect($translate('no traducido')).toBe('no traducido');
          //expect($translate('traducido<i></i>')).toBe('translated<i></i>');
        }));
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

        // And trigger all the above
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
            translateProvider = $translateProvider;
        });
        module('tmh.dynamicLocale', function(tmhDynamicLocaleProvider) {
            tmhDynamicLocaleProvider
                .localeLocationPattern = jasmine.createSpy('localeLocationPattern');
            dynamicLocaleProvider = tmhDynamicLocaleProvider;
        });
    }

});



