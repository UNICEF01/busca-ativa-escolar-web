(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('Reports', function Reports(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			return $resource(API.getURI('reports/:entity'), {entity: '@entity'}, {
				query: {url: API.getURI('reports/:entity'), method: 'POST', headers: headers},
				getCountryStats: {method: 'GET', url: API.getURI('reports/country_stats'), headers: headers},
				getStateStats: {method: 'GET', url: API.getURI('reports/state_stats'), headers: headers},
				getStatusBar: {method: 'GET', url: API.getURI('reports/city_bar'), headers: headers},
				reportsSelo: {url: API.getURI('reports/selo'), method: 'GET', headers: headers},
				createReportSelo: {url: API.getURI('reports/selo/create'), method: 'POST', headers: headers},
				getDailyRematricula: {method: 'GET', url: API.getURI('reports/data_rematricula_daily'), headers: headers}
			});
		});
})();