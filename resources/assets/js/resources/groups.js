(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Groups', function Groups(API, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('groups/:id'), {id: '@id', with: '@with'}, {
				find: {method: 'GET', headers: headers},
                findByTenant: {method: 'POST', url: API.getURI('groups/tenant'), headers: headers},
                findByUf: {method: 'POST', url: API.getURI('groups/uf'), headers: headers},
				updateSettings: {method: 'PUT', url: API.getURI('groups/:id/settings'), headers: headers},
				create: {method: 'POST', headers: headers},
				delete: {method: 'DELETE', headers: headers},
				update: {method: 'PUT', headers: headers}
			});

		});
})();