(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('reports_selo', {
                url: '/reports/selo/',
                templateUrl: '/views/reports/reports_selo.html',
                controller: 'ReportSeloViewerCtrl'
            })
        })
        .controller('ReportSeloViewerCtrl', function($scope, Config, Identity, Reports, Modals) {

            $scope.reports = {};
            $scope.lastOrder = {
                date: null
            };

            $scope.createReport = function() {

                Modals.show(
                    Modals.Confirm(
                        'Confirma a criação de um novo relatório?',
                        'Esse processo pode demorar alguns minutos devido a quantidade de casos registrados na plataforma'
                    )).then(function() {

                    Reports.createReportSelo().$promise
                        .then(function(res) {
                            $scope.lastOrder.date = res.date;
                        });
                });

            };

            $scope.downloadFile = function(file) {
                Identity.provideToken().then(function(token) {
                    window.open(Config.getAPIEndpoint() + 'reports/selo/download?token=' + token + "&file=" + file);
                });
            };

            $scope.refresh = function() {
                $scope.reports = Reports.reportsSelo();
                setInterval(function() {
                    $scope.reports = Reports.reportsSelo();
                }, 600000);
            };

            $scope.refresh();

        });

})();