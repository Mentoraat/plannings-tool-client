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
      },
      {
        events: []
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
        eventDrop:    function(event, delta, revertFunc) { $scope.eventDropped(event, delta, revertFunc);  },
        eventResize:  function(event) { $scope.eventResize(event);},
        drop:         function(date) {
          // this references the event that is being dropped
          $scope.drop(this, date);
          $(this).remove();
        },
      }
    };

    function correctMoments(event, start, end) {
      event.start = start.tz('Europe/Amsterdam').format('YYYY-MM-DD,HH:mm:ss');
      event.end = end.tz('Europe/Amsterdam').format('YYYY-MM-DD,HH:mm:ss');

      return event;
    }

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

    $scope.eventDropped = function(event, delta, revertFunc) {
      if(event.editable !== true) {
        revertFunc();
        return;
      }

      $log.debug('Event "' + event.title + '" has been modified! Sending...');
      $animate.addClass("checking");

      var putEvent = correctMoments(angular.copy(event), event.start, event.end);

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
    $scope.drop = function(event, date) {
      var assignment = angular.copy($(event).data('event'));

      $log.debug('Received assignment named ' + assignment.name);

      var start = date;
      var end = moment(start).add(assignment.length, 'hours');

      var postEvent = {
        assignment: assignment,
        user: {
          id: 1,
          name: 'me',
          uuid: 'aba62cd5-caa6-4e42-a5d6-4909f03038bf',
          accessToken: 'asdf'
        },
        editable: true
      };

      postEvent = correctMoments(postEvent, start, end);

      /*
        The original assignment has already been added,
        so we have to revert this. We can only remove events
        by a 'unique' id, so therefore we assign both to 1 and
        immediately delete it.
      */
      $(event).data('event').id = 1;
      $('#calendar').fullCalendar('removeEvents', 1);

      httpService
        .post("users/USER-aba62cd5-caa6-4e42-a5d6-4909f03038bf/occurrences", postEvent)
        .finally(function() {
          $animate.removeClass("checking");
          postEvent.title = assignment.name;
          postEvent.start = start;
          postEvent.end = end;
          $scope.eventSource[1].events.push(postEvent);
        });
    };

    $scope.eventResize = function(event) {
      $log.debug('Updating time of event ' + event.title);

      var putEvent = correctMoments(angular.copy(event), event.start, event.end);

      httpService
        .put("users/USER-aba62cd5-caa6-4e42-a5d6-4909f03038bf/occurrences", putEvent)
        .finally(function() {
          $animate.removeClass("checking");
        });
    };
  });
