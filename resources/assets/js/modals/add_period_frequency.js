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
                    case 'Quinzenal':
                        newDate = $scope.subtractFortnightOfDayInstance(new Date($scope.clazz.frequencies[0].created_at));
                        break;
                    case 'Mensal':
                        newDate = $scope.subtractMonthOfDayInstance(new Date($scope.clazz.frequencies[0].created_at), 1);
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

            //subtrair um dia considerando finais de semana
            $scope.subtractDaysOfDayInstance = function(date, days) {
                var copy = new Date(Number(date));
                copy.setDate(date.getDate() - days);
                if( copy.getUTCDay() == 0 ) //domingo
                { copy.setDate(copy.getDate() - 2); }
                if( copy.getUTCDay() == 6 ) //sabado
                { copy.setDate(copy.getDate() - 1); }
                return copy;
            };

            //pega a ultima sexta-feira para periodicidade semanal
            $scope.subtractAWeekOfDayInstance = function(date){
                var lastFriday = new Date(Number(date));
                if(date.getDay() == 5){
                    lastFriday = $scope.subtractDaysOfDayInstance(date, 7);
                }
                while (lastFriday.getDay() != 5){
                    lastFriday = $scope.subtractDaysOfDayInstance(date, 1);
                }
                return lastFriday;
            };

            //pega o ultimo dia 15 ou dia 1o
            $scope.subtractFortnightOfDayInstance = function(date){
                var date2 = new Date(Number(date));
                if(date.getUTCDate() > 15){
                    date2.setUTCDate(15);
                }else{ //se é de 1 a 15 pega ultima data do mes anterior
                    date2 = new Date(date.getFullYear(), date.getMonth(), 0);
                }
                return date2;
            };

            //menos um mês completo
            $scope.subtractMonthOfDayInstance = function(date, months) {
                var thisMonth = date.getMonth();
                date.setMonth(thisMonth - months);
                if ((thisMonth - months < 0) && (date.getMonth() != (thisMonth + months))) {
                    date.setDate(0);
                } else if ((thisMonth - months >= 0) && (date.getMonth() != thisMonth - months)) {
                    date.setDate(0);
                }
                return date;
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