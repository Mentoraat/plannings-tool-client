'use strict';

angular.module('planningtoolApp')
    .service('eventService', function($log, httpService) {

    this.get = function(user) {
      return httpService.get('users/USER-' + user + '/occurrences');
    };
});
