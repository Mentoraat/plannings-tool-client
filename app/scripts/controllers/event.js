'use strict';

angular.module('planningtoolApp')
  .controller('eventController', function ($scope, $log, $state, $rootScope, stateService) {
    $scope.previousState = stateService.previousState;
  });
