(function () {
  angular
    .module('BuscaAtivaEscolar')
    .service('HandleErrorResponsesInterceptor', function () {
      function handleResponse(response) {
        if (!response) {
          console.error('[interceptors.server_error] Empty response received!');
          return response;
        }

        if (!response.data) {
          console.error(
            '[interceptors.server_error] Response missing decoded data: ',
            response
          );
          return response;
        }

        // Handled by Exception interceptor
        if (response.data.reason && response.data.reason === 'exception')
          return response;

        var acceptableErrors = [
          200, 206, 201, 204, 202, 301, 304, 302, 303, 307, 308, 100,
        ];

        if (acceptableErrors.indexOf(response.status) === -1) {
          console.error(
            '[interceptors.server_error] Error #' + response.status + ': ',
            response.data,
            response
          );
          // console.log(response.data.error)
          if (response.data.error === 'token_invalid') {
            window.localStorage.clear();
            window.location.href = '/';
          }
          return response;
        }

        return response;
      }

      this.response = handleResponse;
      this.responseError = handleResponse;
    });
})();
