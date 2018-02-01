(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('States', function States(API, Identity, $resource) {

			var authHeaders = API.REQUIRE_AUTH;
			var headers = {};

			return $resource(API.getURI('states/:id'), {id: '@id'}, {
				all: {url: API.getURI('states/all'), method: 'POST', headers: authHeaders, params: {'with': 'users'}},
				cancel: {url: API.getURI('states/:id/cancel'), method: 'POST', headers: authHeaders},
				find: {method: 'GET', headers: headers}
			});

		});
})();