(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.translate
     * @description
     * The Internationalization module handles languages in application.
     * It should be directly configurable by developers.
     * **Warning**: Items in each translations object must match items defined in the Configuration module.
     *
     * @requires https://github.com/angular-translate/angular-translate pascalprecht.translate
     * @requires https://github.com/lgalfaso/angular-dynamic-locale tmh.dynamicLocale
     * @requires appverse.configuration
     */
    angular.module('appverse.translate', [
        'pascalprecht.translate',
        'appverse.configuration',
        'tmh.dynamicLocale'
    ])

    // Get module and set config and run blocks
    //angular.module('appverse.translate')
    .config(configBlock)
        .run(runBlock);


    function configBlock($translateProvider, I18N_CONFIG, tmhDynamicLocaleProvider, $provide) {

        var filesConfig = {
            prefix: 'resources/i18n/',
            suffix: '.json'
        };

        $translateProvider.useStaticFilesLoader(filesConfig);
        $translateProvider.preferredLanguage(I18N_CONFIG.PreferredLocale);
        tmhDynamicLocaleProvider.localeLocationPattern(I18N_CONFIG.localeLocationPattern);

        // Decorate translate directive to change the original behaviour
        // by not removing <i> tags included in the translation text
        $provide.decorator('translateDirective', decorateTranslateDirective);

    }


    function runBlock($log) {

        $log.info('appverse.translate run');

    }


    /**
     * Function used by Angular Decorator to override the behaviour of the original
     * translate directive, which does not keep html tags included in the text to be translated.
     * This will make the directive able to keep no-text tags like <i class="icon"></i>
     * after the translation
     *
     * @param  {array}      $delegate       The original instance (provided by decorator)
     * @param  {Object}     I18N_CONFIG     The I18N_CONFIG appverse object
     * @return {array}                      The modified delegate object
     */
    function decorateTranslateDirective($delegate, I18N_CONFIG) {

        // Get the original directive and its compile function
        var directive = $delegate[0];
        var originalCompile = directive.compile;

        directive.compile = function compile(tElement, tAttr, transclude) {
            var originalLink = originalCompile(tElement, tAttr);
            return function newLink(scope, $element, attr, ctrl) {

                if ($element.children().length) {
                    // Get the element's html and replaces the text to be translated
                    // by a placeholder '%%text%%', so that we can later replace this
                    // with the translated string
                    var text = $element.text();
                    var html = $element.html();
                    var htmlOnlyTags = html.replace(text, '%%text%%');

                    scope.$watch(function () {
                        var translatedText = $element[I18N_CONFIG.acceptHtml ? 'html' : 'text']();
                        var finalHtml = htmlOnlyTags.replace('%%text%%', translatedText);
                        $element.html(finalHtml);
                    });
                }

                originalLink(scope, $element, attr, ctrl);
            }
        }
        return $delegate;
    }
    decorateTranslateDirective.$inject = ['$delegate', 'I18N_CONFIG'];

})();
