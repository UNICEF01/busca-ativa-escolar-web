(function() {

	angular.module('BuscaAtivaEscolar').directive('metricsCountry', function (moment, Platform, Reports, Charts) {

		function init(scope, element, attrs) {

			scope.availableOptions = [
				{id: 1, name: "Ciclo Selo | 2014 - 2020"},
				{id: 2, name: "Ciclo Selo | 2021"},
			];
			scope.selectedOption = {id: 2, name: "Ciclo Selo | 2021"};

			scope.stats = {};

			scope.stats_ciclo_1 = {
				num_tenants: 2518,
				num_ufs: 21,
				num_signups: 3214,
				num_pending_setup: 695,
				num_alerts: 160712,
				num_pending_alerts: 110900,
				num_rejected_alerts: 79865,
				num_total_alerts: 351542,
				num_cases_in_progress: 121644,
				num_children_reinserted: 79595,
				num_pending_signups: 1,
				num_pending_state_signups: 1,
				num_children_in_school: 6069,
				num_children_in_observation: 73526,
				num_children_out_of_school: 48118,
				num_children_cancelled: 32299,
				num_children_transferred: 188,
				num_children_interrupted: 577
			};

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