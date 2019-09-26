(function () {

    angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($scope, moment, Platform, Identity, StaticData, Tenants, Reports, Charts) {

        $scope.identity = Identity;
        $scope.static = StaticData;
        $scope.tenantInfo = Tenants.getSettings();

        $scope.ready = false;
        $scope.showInfo = '';
        $scope.steps = [
            {name: 'Adesão', info: ''},
            {name: 'Configuração', info: ''},
            {name: '1º Alerta', info: ''},
            {name: '1º Caso', info: ''},
            {name: '1ª Rematricula', info: ''}
        ]

        Reports.getStatusBar(function (data) {

            if (data.status !== 'ok') {
                $scope.steps[0].info = data.bar.registered_at && data.bar.registered_at.date || 0;
                $scope.steps[1].info = data.bar.config.updated_at.date || 0;
                $scope.steps[2].info = data.bar.first_alert.date || 0;
                $scope.steps[3].info = data.bar.first_case.date || 0;
                $scope.steps[4].info = data.bar.first_reinsertion_class.date || 0;
                $scope.otherData = data;

                for (var i = 0; $scope.steps.length >= i; i++) {
                    var actualDate = moment($scope.steps[i].info);
                    if (actualDate._i === 0 && $scope.showInfo === '') {
                        $scope.showInfo = i;
                    }
                }
            }
        });


        function init() {
            $scope.states.length = 0;
            for (var i = 0; i < $scope.stateCount; i++) {
                $scope.states.push({
                    name: 'Step ' + (i + 1).toString(),
                    heading: 'Step ' + (i + 1).toString(),
                    isVisible: true
                });
            }
        };
        $scope.stateCountChange = function () {
            $scope.stateCount = isNaN($scope.stateCount) ? 2 : $scope.stateCount;
            init();
        };

        $scope.setCurrent = function (state) {
            for (var i = 0; i < $scope.states.length; i++) {
                $scope.states[i].isCurrent = false;
            }
            state.isCurrent = true;
        };

        $scope.states = [];
        $scope.stateCount = 2;
        init();

        Platform.whenReady(function () {
            $scope.ready = true;
        })


    });

})();