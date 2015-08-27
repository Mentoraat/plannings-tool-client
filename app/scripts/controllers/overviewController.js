'use strict';

angular.module('planningtoolApp')
  .controller('overviewController', function ($scope, $log, $state, $rootScope, stateService) {
    $scope.previousState = stateService.previousState;
    $(".draggable").draggable();
  });
