'use strict';

/**
 * @ngdoc function
 * @name planningtoolApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the planningtoolApp
 */
angular.module('planningtoolApp')
  .controller('mainController', function ($scope, $log, $state, $http, $animate) {
    $scope.eventSource = [
      {
        url: '/v1/users/USER-aba62cd5-caa6-4e42-a5d6-4909f03038bf/occurrences'
      }
    ];

    $scope.uiConfig = {
      calendar:{
        editable: true,

        defaultView: 'agendaWeek',
        timeFormat: 'H:mm',
        axisFormat: 'H:mm',
        slotLabelFormat: 'H:mm',

        droppable: true,

        header:{
          left: 'agendaDay agendaWeek month',
          center: 'title',
          right: 'today prev,next'
        },

        allDayText: 'All Day',

        dayClick:     function(event, jsEvent, view) { $scope.dayClicked(event, jsEvent, view);    },
        eventClick:   function(event, jsEvent, view) { $scope.eventClicked(event, jsEvent, view);  },
        eventDrop:    function(event, delta, revertFunc, jsEvent, ui, view) { $scope.eventDropped(event, delta, revertFunc, jsEvent, ui, view);  },
        eventReceive: function(event, jsEvent, view) { $scope.eventReceived(event, jsEvent, view); },
      }
    };

    /**
     * Activated when a day on the calendar is clicked.
     * @param  {Object} event - Moment object containing information about the date/time clicked
     */
    $scope.dayClicked = function(event) {
      $log.debug('User clicked on a day in the calendar. Dumping debug info.');
      $log.debug(event);
    };

    /**
     * Activated when user clicks on an event
     * @param  {Object} event - The event the user clicked
     * @return Activates state to edit event.
     */
    $scope.eventClicked = function(event) {
      $log.debug('Clicked event named: ' + event.title);
      $state.go('edit-event');
    };

    $scope.eventDropped = function(event, delta, revertFunc, jsEvent, ui, view) {
      $log.debug('Event "' + event.title + '" has been modified! Sending...');
      $animate.addClass("checking");

      $http.put("/v1/users/USER-aba62cd5-caa6-4e42-a5d6-4909f03038bf/occurrences", event)
        .then(function(success){
          $log.debug("Successful PUT: " + success);
        },function(error){
          $log.error(error);
          revertFunc();
        })
        .finally(function() {
          $animate.removeClass("checking");
        });
    };

  /**
   * Fires when event from sidebar is added to the agenda.
   * Deletes the clone from the sidebar and updates the server of the changes
   * @param  {Object} event - The event added to the agenda
   */
    $scope.eventReceived = function(event) {
      $log.debug('Received event named ' + event.title);

      // Add the event to the array of events.
      $scope.eventSource.events.push(event);

      //TODO: Clean up old item


      $log.info($scope.eventSource.events);
    };


  });
