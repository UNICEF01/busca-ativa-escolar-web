(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Alerts', function Alerts(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			var debug = {
				url:'?XDEBUG_SESSION_START=PHPSTORM',
				active:true
			}

			return $resource(API.getURI('alerts/:id'), {id: '@id'}, {
				find: {method: 'GET', headers: headers},
				getPending: {url: API.getURI('alerts/pending' + (debug.active ? debug.url : '')), isArray: false, method: 'GET', headers: headers},
				mine: {url: API.getURI('alerts/mine'), isArray: false, method: 'GET', headers: headers},
				accept: {url: API.getURI('alerts/:id/accept?XDEBUG_SESSION_START=PHPSTORM'), method: 'POST', headers: headers},
				reject: {url: API.getURI('alerts/:id/reject?XDEBUG_SESSION_START=PHPSTORM'), method: 'POST', headers: headers},
			});
		});
})();