'use strict';

angular.module('planningtoolApp')
  .controller('overviewController', function ($scope, $log, $state, $rootScope, $timeout, stateService, assignments) {
    $scope.previousState = stateService.previousState;
    $timeout(function(){
      $(".draggable").draggable();
      $( ".upcomingEventsContainer" ).sortable({
        placeholder: "portlet-placeholder",
        handle: ".draggable"
      });
    });

    $scope.assignments = assignments.items;

  })
  .directive('draggable', function() {
    return {
        link: function(scope, element)
        {
             element.draggable({
               zIndex: 999,
               revert: true,
               revertDuration: 0
             });

             scope.$on('$destroy', function() {
                 element.off('**');
             });
        }
    };
  });