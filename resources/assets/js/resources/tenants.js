(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Tenants', function Tenants(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;
			var headers = {};

			return $resource(API.getURI('tenants/:id'), {id: '@id'}, {
				all: {url: API.getURI('tenants/all'), method: 'POST', headers: authHeaders, params: {'with': 'city,political_admin,operational_admin, users'}},
				getSettings: {url: API.getURI('settings/tenant'), method: 'GET', headers: authHeaders},
				updateSettings: {url: API.getURI('settings/tenant'), method: 'PUT', headers: authHeaders},
				cancel: {url: API.getURI('tenants/:id/cancel'), method: 'POST', headers: authHeaders},
				getRecentActivity: {url: API.getURI('tenants/recent_activity'), method: 'GET', headers: authHeaders},
				find: {method: 'GET', headers: headers},
                findByUf: {url: API.getURI('tenants/uf'), method: 'GET', headers: authHeaders},
				getEducacensoJobs: {url: API.getURI('settings/educacenso/jobs'), method: 'GET', headers: authHeaders},
				getXlsChildrenJobs: {url: API.getURI('settings/import/jobs'), method: 'GET', headers: authHeaders},
			    getSettingsOftenantOfcase: {url: API.getURI('settingstenantcase/tenant/:id'), method: 'GET', headers: authHeaders},
			});

		});
})();