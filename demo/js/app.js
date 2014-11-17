(function() { 'use strict';

angular.module('demoApp', ['COMMONAPI'])
  .controller('DetectionController', DetectionController);

function DetectionController ($scope, Detection) {
  $scope.isMobileText = Detection.isMobileBrowser() ? 'yes' : 'no';
  $scope.hasAppverseMobile = Detection.hasAppverseMobile() ? 'yes' : 'no';
}


})();
