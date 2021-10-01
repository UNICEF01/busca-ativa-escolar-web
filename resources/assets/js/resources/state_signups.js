(function () {
  angular
    .module('BuscaAtivaEscolar')
    .factory('StateSignups', function StateSignups(API, Identity, $resource) {
      var authHeaders = API.REQUIRE_AUTH;
      var headers = {};

      return $resource(
        API.getURI('signups/state/:id'),
        { id: '@id' },
        {
          find: { method: 'GET', headers: authHeaders },

          getPending: {
            url: API.getURI('signups/state/pending'),
            method: 'POST',
            isArray: false,
            headers: authHeaders,
          },
          approve: {
            url: API.getURI('signups/state/:id/approve'),
            method: 'POST',
            headers: authHeaders,
          },
          accept: {
            url: API.getURI('signups/state/:id/accept'),
            method: 'GET',
          },
          accepted: {
            url: API.getURI('signups/state/:id/accepted'),
            method: 'GET',
          },
          reject: {
            url: API.getURI('signups/state/:id/reject'),
            method: 'POST',
            headers: authHeaders,
          },
          updateRegistrationEmail: {
            url: API.getURI('signups/state/:id/update_registration_email'),
            method: 'POST',
            headers: authHeaders,
          },
          resendNotification: {
            url: API.getURI('signups/state/:id/resend_notification'),
            method: 'POST',
            headers: authHeaders,
          },
          register: {
            url: API.getURI('signups/state/register'),
            method: 'POST',
            headers: headers,
          },
          checkIfAvailable: {
            url: API.getURI('signups/state/check_if_available'),
            method: 'POST',
            headers: headers,
          },
        }
      );
    });
})();
