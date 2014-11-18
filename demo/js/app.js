(function() { 'use strict';

angular.module('demoApp', ['COMMONAPI'])
    .controller('DetectionController', DetectionController)
    .controller('CacheController', CacheController);

function DetectionController ($scope, Detection) {
    $scope.isMobileText = Detection.isMobileBrowser() ? 'yes' : 'no';
    $scope.hasAppverseMobile = Detection.hasAppverseMobile() ? 'yes' : 'no';
}

function CacheController ($scope, CacheFactory) {
    CacheFactory.getScopeCache().put('famousStone', 'Rosetta');
}


})();
