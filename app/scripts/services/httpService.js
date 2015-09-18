'use strict';

angular.module('planningtoolApp')
    .service('httpService', function($log, $http) {

      var SERVER_URL = '/v1/';

      this.get = function(endpoint, options) {
        return processRequest($http.get, endpoint, options);
      };

      this.put = function(endpoint, options) {
        return processRequest($http.put, endpoint, options);
      };

      this.post = function(endpoint, options) {
        return processRequest($http.post, endpoint, options);
      };

      function processRequest(method, endpoint, options) {
        options = options || {};
        options.params = options.params || {};
        options.params._t = (new Date()).valueOf();

        return method(SERVER_URL + endpoint, options)
          .then(
            function(res) {
              return res.data;
            },
            $log.warn.bind($log, 'Failed to fetch response')
          );
      }
});
