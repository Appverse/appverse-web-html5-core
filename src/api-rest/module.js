(function() { 'use strict';

/**
 * @ngdoc module
 * @name AppREST
 * @description
 *
 * The Integrated REST module includes communication.
 *
 * It is based on Restangular.
 *
 * Params configuration are set in app-configuration file as constants.
 *
 * SERVICES CLIENT CONFIGURATION
 *
 * The common API includes configuration for one set of REST resources client (1 base URL).
 * This is the most common approach in the most of projects.
 * In order to build several sets of REST resources (several base URLs) you should
 * create scoped configurations. Please, review the below snippet:
 *
 * var MyRestangular = Restangular.withConfig(function(RestangularConfigurer) {
 * RestangularConfigurer.setDefaultHeaders({'X-Auth': 'My Name'})
 * });
 *
 * MyRestangular.one('place', 12).get();
 *
 * The MyRestangular object has scoped properties of the Restangular on with a different
 * configuration.
 */

angular.module('AppREST', ['restangular', 'AppCache', 'AppConfiguration', 'AppSecurity'])

.run(['$log', 'Restangular', 'CacheFactory', 'Oauth_RequestWrapper', 'Oauth_AccessToken', 'REST_CONFIG', 'SECURITY_GENERAL',
    function ($log, Restangular, CacheFactory, Oauth_RequestWrapper, Oauth_AccessToken, REST_CONFIG, SECURITY_GENERAL) {


        Restangular.setBaseUrl(REST_CONFIG.BaseUrl);
        Restangular.setExtraFields(REST_CONFIG.ExtraFields);
        Restangular.setParentless(REST_CONFIG.Parentless);
        var transformer;
        for (var i = 0; i < REST_CONFIG.ElementTransformer.length; i++) {
            $log.debug('Adding transformer');
            transformer = REST_CONFIG.ElementTransformer[i];
            Restangular.addElementTransformer(transformer.route, transformer.transformer);
        }
        Restangular.setOnElemRestangularized(REST_CONFIG.OnElemRestangularized);
        Restangular.setResponseInterceptor(
            function (data, operation, what, url, response) {

                /*
                1-Caches response data or not according to configuration.
                 */
                var cache = CacheFactory.getHttpCache();

                if (cache) {
                    if (REST_CONFIG.NoCacheHttpMethods[operation] === true) {
                        cache.removeAll();
                    } else if (operation === 'put') {
                        cache.put(response.config.url, response.config.data);
                    }
                }

                /*
                 2-Retrieves bearer/oauth token from header.
                 */
                //var tokenInHeader = response.headers(SECURITY_GENERAL.tokenResponseHeaderName);
                var tokenInHeader = response.headers('X-XSRF-Cookie');
                $log.debug('X-XSRF-Cookie: ' + tokenInHeader);
                if(tokenInHeader){

                    Oauth_AccessToken.setFromHeader(tokenInHeader);
                }

                return data;
            }
        );
        if (typeof REST_CONFIG.RequestInterceptor === 'function') {
            $log.debug('Setting RequestInterceptor');
            Restangular.setRequestInterceptor(REST_CONFIG.RequestInterceptor);
        }
        if (typeof REST_CONFIG.FullRequestInterceptor === 'function') {
            $log.debug('Setting FullRequestInterceptor');
            Restangular.setFullRequestInterceptor(REST_CONFIG.FullRequestInterceptor);
        }
        Restangular.setErrorInterceptor(REST_CONFIG.ErrorInterceptor);
        Restangular.setRestangularFields(REST_CONFIG.RestangularFields);
        Restangular.setMethodOverriders(REST_CONFIG.MethodOverriders);
        Restangular.setFullResponse(REST_CONFIG.FullResponse);
        //Restangular.setDefaultHeaders(REST_CONFIG.DefaultHeaders);
        Restangular.setRequestSuffix(REST_CONFIG.RequestSuffix);
        Restangular.setUseCannonicalId(REST_CONFIG.UseCannonicalId);
        Restangular.setEncodeIds(REST_CONFIG.EncodeIds);


        $log.info('AppREST run');

    }]);


})();