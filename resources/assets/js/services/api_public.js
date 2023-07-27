(function () {
  angular
    .module('BuscaAtivaEscolar')
    .service('API_PUBLIC', function API($rootScope) {
      var numPendingRequests = 0;
      var successStatuses = [200, 201, 202, 203];
      var useableErrorStatuses = [400, 401, 403];

      var REQUIRE_AUTH = {
        'X-Require-Auth': 'auth-required',
        'Content-Type': 'application/json',
      };
      var OPTIONAL_AUTH = {
        'X-Require-Auth': 'auth-optional',
        'Content-Type': 'application/json',
      };

      function isLoading() {
        return numPendingRequests > 0;
      }

      function getURI(path) {
        return '@@API@@' + 'lp/' + path;
      }

      function getTokenURI() {
        return '@@TOKEN@@';
      }

      function hasOngoingRequests() {
        return numPendingRequests > 0;
      }

      function pushRequest() {
        numPendingRequests++;
      }

      function popRequest() {
        numPendingRequests--;
      }

      function isUseableError(status_code) {
        return useableErrorStatuses.indexOf(parseInt(status_code, 10)) !== -1;
      }

      function isSuccessStatus(status_code) {
        return successStatuses.indexOf(parseInt(status_code, 10)) !== -1;
      }

      $rootScope.isLoading = isLoading;

      this.getURI = getURI;
      this.getTokenURI = getTokenURI;
      this.pushRequest = pushRequest;
      this.popRequest = popRequest;
      this.hasOngoingRequests = hasOngoingRequests;
      this.isUseableError = isUseableError;
      this.isSuccessStatus = isSuccessStatus;
      this.isLoading = isLoading;

      this.REQUIRE_AUTH = REQUIRE_AUTH;
      this.OPTIONAL_AUTH = OPTIONAL_AUTH;
    });
})();
