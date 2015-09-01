'use strict';

angular.module('planningtoolApp')
    .service('httpService', function($log, $http) {

      var SERVER_URL = '/v1/';

      this.get = function(endpoint, options) {
        options = options || {};
        options.params = options.params || {};
        options.params._t = (new Date()).valueOf();

        return $http
          .get(SERVER_URL + endpoint, options)
          .then(
            function(res) {
              return res.data;
            },
            $log.warn.bind($log, 'Failed to fetch response')
          );
      };
});
