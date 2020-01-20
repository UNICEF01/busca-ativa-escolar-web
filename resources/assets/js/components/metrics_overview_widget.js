(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsOverview', function (moment, Platform, Reports, Report, Charts, Identity) {

		function init(scope, element, attrs) {

			var metrics = {};

			function refreshMetrics() {
				Report.getStatusCity({city: Identity.getCurrentUser().tenant.city.name, uf: Identity.getCurrentUser().tenant.city.uf}, function (data) {
					metrics = data._data;
				});
				// return Reports.query({
				// 	view: 'linear',
				// 	entity: 'children',
				// 	dimension: 'case_status',
				// 	filters: {
				// 		case_status: ['in_progress', 'cancelled', 'completed', 'interrupted'],
				// 		alert_status: ['accepted'],
				// 	}
				// }, function (data) {
				// 	metrics = data.response;
				// });
			}

			scope.getMetrics = function() {
				return metrics;
			};

			Platform.whenReady(function () {
				refreshMetrics();
			});

		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/metrics_overview.html'
		};
	});

})();