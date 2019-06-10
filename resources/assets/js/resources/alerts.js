(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Alerts', function Alerts(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('alerts/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: headers},
				getPending: {url: API.getURI('alerts/pending'), isArray: false, method: 'GET', headers: headers},
				mine: {url: API.getURI('alerts/mine'), isArray: false, method: 'GET', headers: headers},
				accept: {url: API.getURI('alerts/:id/accept'), method: 'POST', headers: headers},
				reject: {url: API.getURI('alerts/:id/reject'), method: 'POST', headers: headers},
			});
		});
})();