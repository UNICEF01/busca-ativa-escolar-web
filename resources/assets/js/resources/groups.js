(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Groups', function Groups(API, $resource) {

			var headers = API.REQUIRE_AUTH;
			return $resource(API.getURI('groups/:id'), {id: '@id', with: '@with'}, {
				find: {method: 'GET', headers: headers},
				findGroupedGroups: {method: 'GET', url: API.getURI('grouped_groups'), headers: headers},
				findUserGroups: {method: 'GET', url: API.getURI('user_groups'), headers: headers},
                findByTenant: {method: 'POST', url: API.getURI('groups/tenant'), headers: headers},
                findByUf: {method: 'POST', url: API.getURI('groups/uf'), headers: headers},
				updateSettings: {method: 'PUT', url: API.getURI('groups/:id/settings'), headers: headers},
				create: {method: 'POST', headers: headers},
				delete: {method: 'DELETE', headers: headers},
				update: {method: 'PUT', headers: headers},
				replaceAndDelete: {method: 'PUT', url: API.getURI('groups/:id/replace_delete'), headers: headers},
				findGroupedByTenant: {method: 'POST', url: API.getURI('groups/grouped/tenant'), headers: headers},
				findById: {method: 'GET', url: API.getURI('groups/:id'), headers: headers}
			});

		});
})();