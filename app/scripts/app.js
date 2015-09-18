'use strict';

/**
 * @ngdoc overview
 * @name planningtoolApp
 * @description
 * # planningtoolApp
 *
 * Main module of the application.
 */
angular
  .module('planningtoolApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.calendar',
    'ui.router',
    'ct.ui.router.extras'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('home', {
        url: "/",
        views: {
          "main": {
            templateUrl: "views/main.html",
            controller: 'mainController',
            controllerAs: 'main'
          },
          "modal": {
            templateUrl: "views/modals/overview.html",
            controller: 'overviewController',
            resolve: {
              assignments : function (httpService) {
                return httpService
                  .get('users/USER-aba62cd5-caa6-4e42-a5d6-4909f03038bf/courses/assignments');
              }
            }
          }
        },
      })
      .state('edit-event', {
        url: "/edit",
        views: {
          "main": {
            templateUrl: "views/main.html",
            controller: 'mainController',
            controllerAs: 'main'
          },
          "modal": {
            templateUrl: "views/modals/editEvent.html",
            controller: 'eventController'
          }
        },
      });
  })
  .config(function($logProvider) {
    // Change to false for production.
    $logProvider.debugEnabled(true);
  })
  .run(['$rootScope', function ($rootScope) {
      $rootScope.previousState = 'home';
      $rootScope.previousStateParam = [];
      $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, fr, fromParams) {
          $rootScope.previousState = fr.name;
          $rootScope.previousStateParam = fromParams;
      });
  }]);
