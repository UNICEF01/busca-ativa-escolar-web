(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsState', function (moment, Platform, Reports, ngToast, Identity) {

		function init(scope, element, attrs) {
			scope.stats = {};

			function refreshMetrics() {
				return Reports.getStateStats({uf: Identity.getCurrentUser()["uf"]}, function (data) {
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
			templateUrl: '/views/components/metrics_state.html'
		};
	});

})();