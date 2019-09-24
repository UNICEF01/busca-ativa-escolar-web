(function () {

    angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($scope, moment, Platform, Identity, StaticData, Tenants, Reports, Charts) {

        $scope.identity = Identity;
        $scope.static = StaticData;
        $scope.tenantInfo = Tenants.getSettings();

        $scope.ready = false;

        $scope.steps = [
            {name: 'Adesão', info: ''},
            {name: 'Configuração', info: ''},
            {name: '1º Alerta', info: ''},
            {name: '1º Caso', info: ''},
            {name: '1ª Rematricula', info: ''}
        ]

        Reports.getStatusBar(function (data) {

            if (data.status !== 'ok') {
                $scope.steps[0].info = data.bar.registered_at.date;
                $scope.steps[1].info = data.bar.config.updated_at.date;
                $scope.steps[2].info = data.bar.first_alert.date;
                $scope.steps[3].info = data.bar.first_case.date;
                $scope.steps[4].info = data.bar.first_reinsertion_class.date;
                $scope.otherData = data;

                angular.forEach($scope.steps, function (value, key) {
                    console.log($scope.showInfo)
                    var actualDate = moment(value.info);
                    if (!actualDate._i && $scope.showInfo == undefined) {
                        $scope.showInfo = key;
                    }
                });


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