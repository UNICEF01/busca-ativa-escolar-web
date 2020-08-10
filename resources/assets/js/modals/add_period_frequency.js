(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('AddPeriodFrequencyModalCtrl', function AddPeriodFrequencyModalCtrl($scope, $q, $uibModalInstance, message, subtitle, clazz, period, canDismiss) {

            $scope.message = message;
            $scope.subtitle = subtitle;
            $scope.clazz = clazz;
            $scope.canDismiss = canDismiss;
            $scope.period = period; //periodicidade

            $scope.addFrequency = function(){
                $scope.clazz.frequencies.unshift({
                    created_at: $scope.getPreviousDate(),
                    qty_enrollment: 0,
                    qty_presence: 0
                });
            };

            $scope.getPreviousDate = function(){
                var newDate = null;
                switch ( $scope.period ) {
                    case 'Diaria':
                        newDate = $scope.subtractDaysOfDayInstance(new Date($scope.clazz.frequencies[0].created_at), 1);
                        break;
                    case 'Semanal':
                        newDate = $scope.subtractDaysOfDayInstance(new Date($scope.clazz.frequencies[0].created_at), 7);
                        break;
                }
                return newDate;
            };

            $scope.getlabelNewPeriod = function(){
                var label = '';
                switch ( $scope.period ) {
                    case 'Diaria':
                        label = 'dia';
                        break;
                    case 'Semanal':
                        label = 'semana';
                        break;
                    case 'Quinzenal':
                        label = 'quinzena';
                        break;
                    case 'Mensal':
                        label = 'mês';
                        break;
                }
                return label;
            };

            $scope.subtractDaysOfDayInstance = function(date, days) {
                var copy = new Date(Number(date));
                copy.setDate(date.getDate() - days);
                return copy;
            };

            $scope.agree = function() {
                alert();
                //$uibModalInstance.close(true);
            };

            $scope.disagree = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();