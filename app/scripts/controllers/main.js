'use strict';

/**
 * @ngdoc function
 * @name planningtoolApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the planningtoolApp
 */
angular.module('planningtoolApp')
  .controller('mainController', function ($scope, $log, $state, httpService, $animate) {
    $scope.eventSource = [
      {
        url: '/v1/users/USER-aba62cd5-caa6-4e42-a5d6-4909f03038bf/occurrences',
        eventDataTransform: function(event) {
          event.start = moment.tz(event.start, 'Europe/Amsterdam');
          event.end = moment.tz(event.end, 'Europe/Amsterdam');

          return event;
        }
      }
    ];

    $scope.uiConfig = {
      calendar:{
        editable: true,

        defaultView: 'agendaWeek',
        timeFormat: 'H:mm',
        axisFormat: 'H:mm',
        slotLabelFormat: 'H:mm',
        timezone: 'local',

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

    $scope.eventDropped = function(event) {
      $log.debug('Event "' + event.title + '" has been modified! Sending...');
      $animate.addClass("checking");

      var putEvent = angular.copy(event);
      putEvent.start = event.start.tz('Europe/Amsterdam').format('YYYY-MM-DD,HH:mm:ss');
      putEvent.end = event.end.tz('Europe/Amsterdam').format('YYYY-MM-DD,HH:mm:ss');

      httpService
        .put("users/USER-aba62cd5-caa6-4e42-a5d6-4909f03038bf/occurrences", putEvent)
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
