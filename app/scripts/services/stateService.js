'use strict';

angular.module('planningtoolApp')
  .service('stateService', function($log, $state, $rootScope) {

    this.previousState = function() {

      // Yes this is ugly, but the ui router doesn't allow for aliases.
      if($rootScope.previousState === '') {
        $rootScope.previousState = 'home';
      }

      $state.go($rootScope.previousState, $rootScope.previousStateParam);
    };
});
