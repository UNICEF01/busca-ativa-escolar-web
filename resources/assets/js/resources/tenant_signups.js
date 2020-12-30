(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('TenantSignups', function TenantSignups(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;
			var headers = {};

			return $resource(API.getURI('signups/tenants/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: authHeaders},

				getPending: {url: API.getURI('signups/tenants/pending'), method: 'POST', isArray: false, headers: authHeaders},
				approve: {url: API.getURI('signups/tenants/:id/approve'), method: 'POST', headers: authHeaders},
				reject: {url: API.getURI('signups/tenants/:id/reject'), method: 'POST', headers: authHeaders},

				updateRegistrationEmail: {url: API.getURI('signups/tenants/:id/update_registration_email'), method: 'POST', headers: authHeaders},
				resendNotification: {url: API.getURI('signups/tenants/:id/resend_notification'), method: 'POST', headers: authHeaders},
				completeSetup: {url: API.getURI('signups/tenants/complete_setup'), method: 'POST', headers: authHeaders},

				register: {url: API.getURI('signups/tenants/register'), method: 'POST', headers: headers},
				getViaToken: {url: API.getURI('signups/tenants/via_token/:id'), method: 'GET', headers: headers},
				complete: {url: API.getURI('signups/tenants/:id/complete?XDEBUG_SESSION_START=PHPSTORM'), method: 'POST', headers: headers},

				getMayorByCPF: {url: API.getURI('signups/tenants/mayor/by/cpf/:cpf'), method: 'GET', headers: authHeaders},
				getUserViaToken: {url: API.getURI('signups/users/via_token/:id'), method: 'GET', headers: headers},
				activeUser: {url: API.getURI('signups/users/:id/confirm'), method: 'POST', headers: headers}

			});

		});
})();