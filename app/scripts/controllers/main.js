'use strict';

/**
 * @ngdoc function
 * @name planningtoolApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the planningtoolApp
 */
angular.module('planningtoolApp')
  .controller('mainController', function ($scope, $log, $state) {
    $scope.eventSource = {
      events: [ // put the array in the `events` property
          {
              title  : 'event1',
              start  : '2015-08-01'
          },
          {
              title  : 'event2',
              start  : '2015-08-27',
              end    : '2015-08-28'
          },
          {
              title  : 'event3',
              start  : '2015-08-09T12:30:00',
              editable : false,
          }
      ],

    };

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
        eventDrop:    function(event, jsEvent, view) { $scope.eventDropped(event, jsEvent, view);  },
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
      $log.debug('Dropped event named ' + event.title);
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
