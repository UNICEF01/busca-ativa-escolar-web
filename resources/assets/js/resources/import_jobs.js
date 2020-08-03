(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('ImportJobs', function ImportJobs(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;

			return $resource(API.getURI('maintenance/import_jobs/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: authHeaders},
				all: {url: API.getURI('maintenance/import_jobs'), method: 'GET', headers: authHeaders},
				upload: {url: API.getURI('maintenace/import_jobs/new'), method: 'POST', headers: authHeaders},
				process: {url: API.getURI('maintenance/import_jobs/:id/process'), method: 'POST', headers: authHeaders}
			});

		});
})();