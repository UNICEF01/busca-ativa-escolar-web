(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Users', function Users(API, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('users/:id'), {id: '@id', with: '@with'}, {
				myself: {url: API.getURI('users/myself'), method: 'GET', headers: headers},
				find: {method: 'GET', headers: headers},
				create: {method: 'POST', headers: headers},
				update: {method: 'PUT', headers: headers},
				search: {url: API.getURI('users/search'), method: 'POST', isArray: false, headers: headers},
				suspend: {method: 'DELETE', headers: headers},
				restore: {url: API.getURI('users/:id/restore'), method: 'POST', headers: headers},
				reports: {url: API.getURI('users/reports'), method: 'GET', headers: headers},
				createReport: {url: API.getURI('users/reports/create'), method: 'POST', headers: headers}
			});

		});
})();