(function() {
    'use strict';

    angular.module('appverse.ionic')

    .controller('ModalNotAllowedCntrl',
        function($scope, $uibModalInstance, Detection, $location, $timeout, IONIC_CONFIG) {
            if (Detection.isMobileBrowser()) {
                $scope.device = 'device';
            } else {
                $scope.device = 'desktop';
            }

            $scope.seconds = 5;
            var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

            function timer() {
                $scope.seconds = $scope.seconds - 1;
                $scope.$evalAsync($scope.seconds);
                if ($scope.seconds <= 0) {
                    clearInterval(counter);
                    $uibModalInstance.close();
                    $timeout(function() {
                        $location.path(IONIC_CONFIG.redirectionPath);
                    }, 300);
                    return;
                }
            }
        });
})();
