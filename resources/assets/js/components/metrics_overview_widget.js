(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsOverview', function (moment, Platform, Reports, Charts) {

		function init(scope, element, attrs) {

			var metrics = {};

			function refreshMetrics() {
				return Reports.query({
					view: 'linear',
					entity: 'children',
					dimension: 'case_status',
					filters: {
						case_status: ['in_progress', 'cancelled', 'completed', 'interrupted'],
						alert_status: ['accepted', ]
					}
				}, function (data) {
					metrics = data.response;
				});
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