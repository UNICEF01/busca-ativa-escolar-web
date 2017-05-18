(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsCountry', function (moment, Platform, Reports, Charts) {

		function init(scope, element, attrs) {
			scope.stats = {};

			function refreshMetrics() {
				return Reports.getCountryStats(function (data) {
					if(data.status !== 'ok') {
						ngToast.danger('Ocorreu um erro ao carregar os números gerais da plataforma. (err: ' + data.reason + ')');
						return;
					}

					scope.stats = data.stats;
				});
			}

			Platform.whenReady(function () {
				refreshMetrics();
			});
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/metrics_country.html'
		};
	});

})();