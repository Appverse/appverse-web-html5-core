(function() { 'use strict';

angular.module('demoApp', ['COMMONAPI'])
  .controller('DetectionController', DetectionController);

function DetectionController ($scope, Detection) {
  $scope.isMobileText = Detection.isMobile ? 'yes' : 'no';
  $scope.hasAppverseMobile = Detection.hasAppverseMobile ? 'yes' : 'no';
}


})();
