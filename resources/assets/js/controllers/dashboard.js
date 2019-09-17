(function () {

    angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($scope, moment, Platform, Identity, StaticData, Tenants, Reports, Charts) {

        $scope.identity = Identity;
        $scope.static = StaticData;
        $scope.tenantInfo = Tenants.getSettings();

        $scope.ready = false;

        $scope.steps = ['Adesão', 'Configuração', 'Alertas', 'Casos', 'Rematriculas']
        $scope.steps = [{nome: 'Adesão', data: '01/01/2015'}, {nome: 'Configuração', data: '01/01/2015'}, {nome: 'Alertas', data: 'NI'}, {nome: 'Casos', data: 'NI'}, {nome: 'Rematriculas', data: 'NI'}]


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