(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('user_report', {
                url: '/report/users/',
                templateUrl: '/views/users/report.html',
                controller: 'ReportUsersCtrl'
            })
        })
        .controller('ReportUsersCtrl', function ($scope, $rootScope, ngToast, API, Config, Platform, Identity, Users, Groups, Tenants, StaticData, Modals) {

            $scope.reports = {};
            $scope.lastOrder = {
                date: null
            };

            $scope.createReport = function() {

                Modals.show(
                    Modals.Confirm(
                        'Confirma a criação de um novo relatório?',
                        'Esse processo pode demorar alguns minutos devido a quantidade de usuários registrados na plataforma'
                    )).then(function () {
                        Users.createReport().$promise
                        .then(function (res) {
                            $scope.lastOrder.date = res.date;
                        });
                    });

            };

            $scope.downloadFile = function(file) {
                Identity.provideToken().then(function (token) {
                    window.open(Config.getAPIEndpoint() + 'users/reports/download?token=' + token + "&file=" + file);
                });
            };

            $scope.refresh = function() {
                $scope.reports = Users.reports();
                setInterval(function() {
                    $scope.reports = Users.reports();
                }, 600000);
            };

            $scope.refresh();

        });

})();