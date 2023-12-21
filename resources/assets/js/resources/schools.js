(function () {
  angular
    .module('BuscaAtivaEscolar')
    .factory('Schools', function Schools(API, $resource) {
      var headers = API.REQUIRE_AUTH;

      // Interceptor function to add the status code to the response.resource
      var addStatusCodeInterceptor = {
        response: function (response) {
          // Add the status code to the response.resource
          response.resource.statusCode = response.status;

          // Return the response to the calling code
          return response.resource;
        },
      };

      return $resource(
        API.getURI('schools/:id'),
        { id: '@id', with: '@with' },
        {
          find: {
            method: 'GET',
            headers: headers,
            interceptor: addStatusCodeInterceptor,
          },
          save: {
            method: 'POST',
            headers: headers,
            interceptor: addStatusCodeInterceptor,
          },
          search: {
            url: API.getURI('schools/search'),
            method: 'POST',
            headers: headers,
            interceptor: addStatusCodeInterceptor,
          },
          getById: {
            url: API.getURI('schools/public'),
            method: 'GET',
            interceptor: addStatusCodeInterceptor,
          },
          all_educacenso: {
            url: API.getURI('schools/all_educacenso'),
            method: 'GET',
            headers: headers,
            interceptor: addStatusCodeInterceptor,
          },
          update: {
            method: 'PUT',
            headers: headers,
            interceptor: addStatusCodeInterceptor,
          },
          send_educacenso_notifications: {
            url: API.getURI('schools/educacenso/notification'),
            method: 'POST',
            headers: headers,
            interceptor: addStatusCodeInterceptor,
          },
          all_schools: {
            url: API.getURI('schools/all'),
            method: 'GET',
            headers: headers,
            interceptor: addStatusCodeInterceptor,
          },
          send_frequency_notifications: {
            url: API.getURI('schools/frequency/notification'),
            method: 'POST',
            headers: headers,
            interceptor: addStatusCodeInterceptor,
          },
        }
      );
    });
})();
