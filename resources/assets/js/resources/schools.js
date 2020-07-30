(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Schools', function Schools(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;
		
			return $resource(API.getURI('schools/:id'), {id: '@id'}, {

				find: {method: 'GET', headers: headers},
				search: {url: API.getURI('schools/search'), method: 'POST', headers: headers}, 
				getById: {url: API.getURI('schools/public'), method: 'GET'},
				all_educacenso: {url: API.getURI('schools/all_educacenso?XDEBUG_SESSION_START=PHPSTORM'), method: 'GET', headers: headers},
				update: {method: 'PUT', headers: headers},
				send_notifications: {url: API.getURI('schools/notification'), method: 'POST', headers: headers},
				
			});

		});
})();