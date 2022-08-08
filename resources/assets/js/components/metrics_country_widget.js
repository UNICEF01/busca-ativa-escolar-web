(function() {
    angular
        .module('BuscaAtivaEscolar')
        .directive('metricsCountry', function(Platform, Reports) {
            function init(scope) {
                scope.availableOptions = [
                    { id: 1, name: 'Ciclo Estratégia | 2021 - 2024 (Status atual)' },
                    { id: 2, name: 'Ciclo Estratégia 2017-2020 (Status em 31/12/2020)' },
                    { id: 3, name: 'Ciclo Estratégia 2017-2020 (Status em 31/12/2019)' },
                    { id: 4, name: 'Ciclo Estratégia 2017-2020 (Status em 31/12/2018)' },
                    { id: 5, name: 'Ciclo Estratégia 2017-2020 (Status em 31/12/2017)' }
                ];
                scope.selectedOption = {
                    id: 1,
                    name: 'Ciclo Estratégia | 2021 - 2024 (Status atual)'
                };

                scope.stats = {};

                scope.stats_ciclo_2 = {
                    num_tenants: 2518,
                    num_ufs: 21,
                    num_signups: 3214,
                    num_pending_setup: 695,
                    num_alerts: 160719,
                    num_pending_alerts: 110836,
                    num_rejected_alerts: 79865,
                    num_total_alerts: 351420,
                    num_cases_in_progress: 121644,
                    num_children_reinserted: 79595,
                    num_pending_signups: 10,
                    num_pending_state_signups: 10,
                    num_children_in_school: 6050,
                    num_children_in_observation: 73545,
                    num_children_out_of_school: 48060,
                    num_children_cancelled: 32299,
                    num_children_transferred: 188,
                    num_children_interrupted: 577
                };

                scope.stats_ciclo_3 = {
                    num_tenants: 2518,
                    num_ufs: 21,
                    num_signups: 3214,
                    num_pending_setup: 695,
                    num_alerts: 55106,
                    num_pending_alerts: 88518,
                    num_rejected_alerts: 42081,
                    num_total_alerts: 185705,
                    num_cases_in_progress: 121644,
                    num_children_reinserted: 79595,
                    num_pending_signups: 1,
                    num_pending_state_signups: 1,
                    num_children_in_school: 307,
                    num_children_in_observation: 16800,
                    num_children_out_of_school: 26040,
                    num_children_cancelled: 11959,
                    num_children_transferred: 0,
                    num_children_interrupted: 0
                };
                scope.stats_ciclo_4 = {
                    num_tenants: 2518,
                    num_ufs: 21,
                    num_signups: 3214,
                    num_pending_setup: 695,
                    num_alerts: 5776,
                    num_pending_alerts: 24866,
                    num_rejected_alerts: 11663,
                    num_total_alerts: 42305,
                    num_cases_in_progress: 121644,
                    num_children_reinserted: 79595,
                    num_pending_signups: 1,
                    num_pending_state_signups: 1,
                    num_children_in_school: 143,
                    num_children_in_observation: 316,
                    num_children_out_of_school: 4655,
                    num_children_cancelled: 662,
                    num_children_transferred: 0,
                    num_children_interrupted: 0
                };

                scope.stats_ciclo_5 = {
                    num_tenants: 2518,
                    num_ufs: 21,
                    num_signups: 3214,
                    num_pending_setup: 695,
                    num_alerts: 114,
                    num_pending_alerts: 149,
                    num_rejected_alerts: 10,
                    num_total_alerts: 273,
                    num_cases_in_progress: 121644,
                    num_children_reinserted: 79595,
                    num_pending_signups: 1,
                    num_pending_state_signups: 1,
                    num_children_in_school: 2,
                    num_children_in_observation: 1,
                    num_children_out_of_school: 102,
                    num_children_cancelled: 9,
                    num_children_transferred: 0,
                    num_children_interrupted: 0
                };

                function refreshMetrics() {
                    return Reports.getCountryStats(function(data) {
                        if (data.status !== 'ok') {
                            ngToast.danger(
                                'Ocorreu um erro ao carregar os números gerais da plataforma. (err: ' +
                                data.reason +
                                ')'
                            );
                            return;
                        }

                        scope.stats = data.stats;
                    });
                }

                Platform.whenReady(function() {
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