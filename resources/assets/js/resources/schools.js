(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Schools', function Schools(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('schools/:id'), {id: '@id'}, {

				find: {method: 'GET', headers: headers},
				search: {url: API.getURI('schools/search'), method: 'POST', headers: headers},
				all_educacenso: {url: API.getURI('schools/all_educacenso?XDEBUG_SESSION_START=PHPSTORM'), method: 'GET', headers: headers},

			});

		});
})();