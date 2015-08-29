'use strict';

/**
 * @ngdoc function
 * @name planningtoolApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the planningtoolApp
 */
 angular.module('planningtoolApp')
  .controller('mainController', function ($scope) {
    $scope.events = [ // put the array in the `events` property
        {
            title  : 'event1',
            start  : '2015-08-01'
        },
        {
            title  : 'event2',
            start  : '2015-08-05',
            end    : '2015-08-07'
        },
        {
            title  : 'event3',
            start  : '2015-08-09T12:30:00',
            editable : false,
        }
    ];

    $scope.uiConfig = {
      calendar:{
        editable: true,
        events: $scope.events,

        defaultView: 'agendaWeek',
        timeFormat: 'H:mm',
        axisFormat: 'H:mm',
        slotLabelFormat: 'H:mm',

        header:{
          left: 'agendaDay agendaWeek month',
          center: 'title',
          right: 'today prev,next'
        },

        allDayText: 'All day',

        dayClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };

    $scope.alertEventOnClick = function() {
      console.log($scope.events);
    };
  });
