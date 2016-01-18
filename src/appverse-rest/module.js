(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.rest
     * @description
     *
     * The Integrated REST module includes communication.
     *
     * It is based on Restangular.
     *
     * Params configuration are set in app-configuration file as constants.
     *
     * ## Services Client Configuration
     *
     * The common API includes configuration for one set of REST resources client (1 base URL).
     * This is the most common approach in the most of projects.
     * In order to build several sets of REST resources (several base URLs) you should
     * create scoped configurations. Please, review the below snippet:
     *
     *     var MyRestangular = Restangular.withConfig(function(RestangularConfigurer) {
     *       RestangularConfigurer.setDefaultHeaders({'X-Auth': 'My Name'})
     *     });
     *
     *     MyRestangular.one('place', 12).get();
     *
     * The MyRestangular object has scoped properties of the Restangular on with a different
     * configuration.
     *
     * @requires  https://github.com/mgonto/restangular restangular
     * @requires  appverse.configuration
     * @requires  appverse.utils
     *
     */
    angular.module('appverse.rest', [
        'restangular',
        'appverse.configuration',
        'appverse.utils'
    ])

    .run(function($injector, $log, Restangular, ModuleSeeker, REST_CONFIG) {

        $log.info('appverse.rest run');

        tryToIntegrateSecurity();
        tryToIntegrateCache();

        Restangular.setBaseUrl(REST_CONFIG.BaseUrl);
        Restangular.setExtraFields(REST_CONFIG.ExtraFields);
        Restangular.setParentless(REST_CONFIG.Parentless);
        Restangular.setRestangularFields(REST_CONFIG.RestangularFields);
        Restangular.setMethodOverriders(REST_CONFIG.MethodOverriders);
        Restangular.setFullResponse(REST_CONFIG.FullResponse);
        if (REST_CONFIG.DefaultHeaders) {
            Restangular.setDefaultHeaders(REST_CONFIG.DefaultHeaders);
        }
        Restangular.setRequestSuffix(REST_CONFIG.RequestSuffix);
        Restangular.setUseCannonicalId(REST_CONFIG.UseCannonicalId);
        Restangular.setEncodeIds(REST_CONFIG.EncodeIds);

        function tryToIntegrateSecurity() {
            var restFactory = $injector.get('RESTFactory'),
                $log = $injector.get('$log'),
                SECURITY_GENERAL = $injector.get('SECURITY_GENERAL');

            if (ModuleSeeker.exists('appverse.security')) {
                var oauthRequestWrapperService = $injector.get('Oauth_RequestWrapper');
                if (SECURITY_GENERAL.securityEnabled) {
                    restFactory.wrapRequestsWith(oauthRequestWrapperService);
                    $log.debug("REST communication is secure. Security is enabled." +
                        " REST requests will be wrapped with authorization headers.");
                    return;
                }
            }

            $log.debug("REST communication is not secure. Security is not enabled.");
        }

        function tryToIntegrateCache() {
            if (ModuleSeeker.exists('appverse.cache')) {
                var restFactory = $injector.get('RESTFactory'),
                    avCacheFactory = $injector.get('avCacheFactory'),
                    cache = avCacheFactory.getHttpCache();
                restFactory.setCache(cache);
            }
        }

        if (REST_CONFIG.HATEOAS) {

            var CONTENT_TAG = 'content';
            var HREF_TAG = 'href';
            var LINKS_TAG = 'links';

            Restangular.setResponseExtractor(function(data, operation) {
                var returnData = data;
                if (operation === 'getList' && CONTENT_TAG in data) {
                    for (var i = 0; i < data[CONTENT_TAG].length; i++) {
                        data[CONTENT_TAG][i][HREF_TAG] = data[CONTENT_TAG][i][LINKS_TAG][0][HREF_TAG];
                        delete data[CONTENT_TAG][i][LINKS_TAG];
                    }
                    returnData = data[CONTENT_TAG];
                    delete data[CONTENT_TAG];
                    for (var key in data) {
                        returnData[key] = data[key];
                    }
                }
                return returnData;
            });
        }
    });

})();