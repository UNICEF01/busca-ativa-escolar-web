(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Cities', function Cities(API, Identity, $resource) {

			let headers = {};

			return $resource(API.getURI('cities/:id'), {id: '@id'}, {
				get: {method: 'GET', headers: headers},
				save: {method: 'POST', headers: headers},
				query: {method: 'GET', isArray: true, headers: headers},
				remove: {method: 'DELETE', headers: headers},
				delete: {method: 'DELETE', headers: headers}
			});

		});
})();