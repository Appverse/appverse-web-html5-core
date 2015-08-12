(function() { 'use strict';

/**
 * @ngdoc module
 * @name appverse.ionic
 *
 * @description
 * Provides ionic management views
 *
 * @requires appverse.utils
 */
angular.module('appverse.ionic', []);


})();
(function() {
    'use strict';


angular.module('appverse.ionic')
    .run(run).config(['$stateProvider', 'DetectionProvider', 'PROJECT_CONFIG', function($stateProvider, DetectionProvider, PROJECT_CONFIG){
          if(DetectionProvider.isMobileBrowser()){
                     $stateProvider.state(PROJECT_CONFIG.MainState, {
                        abstract:true,
                        // Use a url of "/" to set a states as the "index".
                        url: "",
                        templateUrl: 'mobileviews/'+PROJECT_CONFIG.MainState+'.html'
                    }); 
                }else{
                      $stateProvider.state(PROJECT_CONFIG.MainState, {
                        abstract:true,
                        // Use a url of "/" to set a states as the "index".
                        url: "",
                        templateUrl: 'views/'+PROJECT_CONFIG.MainState+'.html'
                    }); 
                }
        
    }]);

function run($log, Detection, $rootScope, $state, $modal) {
    $log.info('appverse.ionic run');
     $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
            //reset templateUrl and controller value if is necessary
            if(toState.templateUrl.indexOf("mobileview") >= 0){
                toState.templateUrl = toState.templateUrl.split("mobile")[1]; 
                toState.controller = toState.controller.split("_mobile")[0];
            }
   
            //Security checkpoint: check state access permissions before changing state
            if((!Detection.isMobileBrowser() && toState.data.access.indexOf("web") == -1) || (Detection.isMobileBrowser() && toState.data.access.indexOf("mobile") == -1)){
                event.preventDefault(); 
                
                $modal.open({
                    templateUrl: 'views/modals/not-allowed.html',
                    controller: 'ModalNotAllowedCntrl',
                    resolve: { 
                        isMobile:function(){
                            return Detection.isMobileBrowser();
                        }
                    }
                });
                
            }
            
            if(Detection.isMobileBrowser()){
                toState.templateUrl = "mobile"+toState.templateUrl;
                if(!toState.data.shareController){
                    toState.controller = toState.controller+"_mobile";
                }
            }          

        });

}
run.$inject = ["$log", "Detection", "$rootScope", "$state", "$modal"];

})();