(function () {
    'use strict';

    var requires = [
        'appverse.detection',
        'ui.router',
        'ui.bootstrap'
    ];


    /**
     * @ngdoc module
     * @name appverse.ionic
     *
     * @description
     * Provides ionic management views
     *
     * @requires appverse.detection
     * @requires ui.router
     * @requires ui.bootstrap
     */

    angular.module('appverse.ionic', requires);


})();
(function () {
    'use strict';

    angular.module('appverse.ionic')
        .run(run).config(['$stateProvider', 'DetectionProvider', 'IONIC_CONFIG', function ($stateProvider, DetectionProvider, IONIC_CONFIG) {
            if (DetectionProvider.isMobileBrowser()) {
                $stateProvider.state(IONIC_CONFIG.MainState, {
                    abstract: true,
                    // Use a url of "/" to set a states as the "index".
                    url: "",
                    templateUrl: 'mobileviews/' + IONIC_CONFIG.MainState + '.html'
                });
            } else {
                $stateProvider.state(IONIC_CONFIG.MainState, {
                    abstract: true,
                    // Use a url of "/" to set a states as the "index".
                    url: "",
                    templateUrl: 'views/' + IONIC_CONFIG.MainState + '.html'
                });
            }

    }]);

    function run($log, Detection, $rootScope, $state, $modal) {
        $log.info('appverse.ionic run');
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            //reset templateUrl and controller value if is necessary
            if (toState.templateUrl.indexOf("mobileview") >= 0) {
                toState.templateUrl = toState.templateUrl.split("mobile")[1];
                toState.controller = toState.controller.split("_mobile")[0];
            }

            //Security checkpoint: check state access permissions before changing state
            if ((!Detection.isMobileBrowser() && toState.data.access.indexOf("web") === -1) ||
                (Detection.isMobileBrowser() && toState.data.access.indexOf("mobile") === -1)) {
                event.preventDefault();

                $modal.open({
                    templateUrl: 'views/modals/not-allowed.html',
                    controller: 'ModalNotAllowedCntrl',
                    resolve: {
                        isMobile: function () {
                            return Detection.isMobileBrowser();
                        }
                    }
                });

            }

            if (Detection.isMobileBrowser()) {
                toState.templateUrl = "mobile" + toState.templateUrl;
                if (toState.data.mobileController) {
                    toState.controller = toState.data.mobileController;
                }
            }

        });

    }
    run.$inject = ["$log", "Detection", "$rootScope", "$state", "$modal"];

})();
