function() { 'use strict';

angular.module('appverse.native').factory('AppverseNative', AppverseNative);

    /**
     * @ngdoc service
     * @name AppverseNative
     * @module appverse.native
     * @description This module provides basic quick standard access to a Native functions
     *
     */
            
    function AppverseNative($log, $q, Detection, $window) {
        ////////////////////////////////////////////////////////////////////////////////////
        // ADVICES ABOUT PROMISES
        //
        // 1-PROMISES
        // All Restangular requests return a Promise. Angular's templates
        // are able to handle Promises and they're able to show the promise
        // result in the HTML. So, if the promise isn't yet solved, it shows
        // nothing and once we get the data from the server, it's shown in the template.
        // If what we want to do is to edit the object you get and then do a put, in
        // that case, we cannot work with the promise, as we need to change values.
        // If that's the case, we need to assign the result of the promise to a $scope variable.
        ////////////////////////////////////////////////////////////////////////////////////

        var factory, deferredGeo, deferredNetwork, geoTryNumber;
        factory = deferredGeo = deferredNetwork = {};
        geoTryNumber = 0;
        
        var promises = [];
       
         $window.callbackGeo = function(result){
            if(result){
               Appverse.Geo.StartUpdatingLocation('callbackGeoStart', 'callbackGeoStart');
            }else{
                deferredGeo.reject(result);   
            }
        };
        
        $window.callbackGeoStart = function(result){
            if(result){
                Appverse.Geo.GetCoordinates('callbackGeoCoordinates', 'callbackGeoCoordinates');
            }else{
                deferredGeo.reject(result);     
            }
        };
        
         $window.callbackGeoCoordinates = function(coordinates){
             geoTryNumber++;
             if(coordinates.XCoordinate!=0 && coordinates.YCoordinate!=0 && coordinates.XDoP<500 && coordinates.YDoP<500){
                    deferredGeo.resolve(coordinates);
                    Appverse.Geo.StopUpdatingLocation('callbackGeoStop', 'callbackGeoStop');
             }else{
                if(geoTryNumber > 10){
                    deferredGeo.reject(coordinates);  
                    Appverse.Geo.StopUpdatingLocation('callbackGeoStop', 'callbackGeoStop');
                }else{
                    setTimeout(function(){
                        callbackGeoStart(true);
                    },2000);
                }
             }
         };
        
        $window.StopUpdatingLocation = function(result){};
        
         $window.callbackNetwork = function(result){
            if(result){
                deferredNetwork.resolve(result); 
            }else{
                deferredNetwork.reject(result);   
            }
        };
        

        
        factory.getCoordinates = function(){
            deferredGeo = $q.defer();
            if(Detection.hasAppverseMobile()){
                Appverse.Geo.IsGPSEnabled('callbackGeo','callbackGeo');
            }else{
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(showPosition);
                } else {
                    return deferredGeo.reject(false);
                }
            }
            return deferredGeo.promise;
        };
        
         function showPosition(position) {
             var coordinates = {
                "XCoordinate":position.coords.latitude,
                "YCoordinate":position.coords.longitude,
                 "ZCoordinate":0,
                 "XDoP":position.coords.accuracy,
                 "YDoP":position.coords.accuracy
             };
            deferredGeo.resolve(coordinates);
        }
        
        
        factory.isNetworkReachable = function(){
            deferredNetwork = $q.defer();

            if(Detection.hasAppverseMobile()){ 
                Appverse.Net.IsNetworkReachable("www.google.com",'callbackNetwork','callbackNetwork');
            }else{
                if(Detection.isOnline){
                    deferredNetwork.resolve(true);
                }else{
                    deferredNetwork.reject(false);
                }
            }
            return deferredNetwork.promise;
        };
        
        factory.getBrowserInformation = function(){            
            if(Detection.hasAppverseMobile()){ 
                 return {
                        isMobileBrowser: !Appverse.is.Desktop,
                        isIphone: Appverse.is.iPhone,
                        isWindowsPhone:Appverse.is.Windows,
                        isWindows: Appverse.is.Windows,
                        isBlackberry:Appverse.is.Blackberry,
                        isAndroid:Appverse.is.Android,
                        isiOS:Appverse.is.iOS,
                        isTablet:Appverse.is.Tablet,
                        isPhone: !Appverse.is.Desktop,
                        isIpod:Appverse.is.iPod,
                        isIpad: Appverse.is.iPad,
                        isLinux:Appverse.is.Linux,
                        isMac:Appverse.is.Mac
                       };
            }else{
                var iOS, iphone, ipod, ipad, android, mac, windows, linux, blackberry, tablet, windowsPhone;
                iOS = iphone = ipod = ipad = android = mac = windows = linux = blackberry = tablet = windowsPhone = false;
                if(navigator.userAgent.match(/iPhone/i)) { iOS = true; iphone = true; }
                if(navigator.userAgent.match(/iPod/i)){ iOS = true; ipod = true; }
                if(navigator.userAgent.match(/iPad/i)){ iOS = true; ipad = true; }
                if(navigator.userAgent.indexOf("android") > -1){ android = true; }
                if(navigator.platform.toUpperCase().indexOf('MAC')>=0){ mac = true; }
                if (navigator.appVersion.indexOf("Win")!=-1){ windows = true; };
                if (navigator.appVersion.indexOf("Linux")!=-1){ linux = true; };
                if (navigator.userAgent.toLowerCase().indexOf("blackberry") >= 0){ blackberry = true; }
                if((/ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase()))){ tablet = true;  }
                if(navigator.userAgent.match(/Windows Phone/i) || navigator.userAgent.match(/iemobile/i)){ windowsPhone = true; }

                
                return {
                        isMobileBrowser:Detection.isMobileBrowser(),
                        isIphone: iphone,
                        isWindowsPhone:windowsPhone,
                        isWindows: windows,
                        isBlackberry:blackberry,
                        isAndroid:android,
                        isiOS:iOS,
                        isTablet:tablet,
                        isPhone:Detection.isMobileBrowser(),
                        isIpod:ipod,
                        isIpad: ipad,
                        isLinux:linux,
                        isMac:mac
                       };
            }
        };
    

        return factory;

    }
    AppverseNative.$inject = ["$log", "$q", "Detection", "$window"];

})();