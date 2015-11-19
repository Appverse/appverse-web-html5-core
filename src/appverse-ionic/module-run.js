(function() {
    'use strict';

    angular.module('appverse.ionic')
        .run(run);

    function run($log, Detection, $rootScope, $state, $modal, IONIC_CONFIG) {
        $log.info('appverse.ionic run');

        function showModalPrompt() {
            if (IONIC_CONFIG.modalPrompt) {

                $modal.open({
                    templateUrl: 'appverse-ionic/not-allowed.html',
                    controller: 'ModalNotAllowedCntrl'
                });
            }

        }

        function transformState(toState) {
            //check if a mobile view exists, if is available in our envirnoment and if needs a different controller
            if (toState.data.mobile && Detection.isMobileBrowser()) {
                toState.templateUrl = toState.templateUrl.split('.html')[0] + IONIC_CONFIG.suffix + '.html';
                if (toState.data.controller) {
                    toState.controller = toState.controller + IONIC_CONFIG.suffix;
                }
            }

            //After change (if is necessary) the template and controller, delete data object to avoid all the process the next time
            delete toState.data;
        }

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

            if (toState.data) {
                //if toState.data exists, check restrict attribute
                if (toState.data.restrict) {
                  //if restrict, check environment
                    if ((!Detection.isMobileBrowser() && toState.data.mobile) || (Detection.isMobileBrowser() && !toState.data.mobile)) {
                        showModalPrompt();
                    } else {
                        transformState(toState);
                    }
                } else {
                  //if NOT restrict, check environment
                  transformState(toState);
                }
            }
        });

    }
})();
