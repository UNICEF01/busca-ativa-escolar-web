(function() {
    angular.module('BuscaAtivaEscolar').filter('dateFormat', function() {
        return function(firtDate) {
            var now = new Date();
            var fDate = new Date(firtDate);
            var dateNow = moment([now.getFullYear(), now.getMonth(), now.getDate()]);
            var startDate = moment([fDate.getFullYear(), fDate.getMonth(), fDate.getDate()]);
            var diffDuration = moment.duration(dateNow.diff(startDate));

            var year = diffDuration.years() > 0 ? diffDuration.years() + (diffDuration.years() === 1 ? ' ano ' : ' anos ') : '';
            var month = diffDuration.months() > 0 ? diffDuration.months() + (diffDuration.months() === 1 ? ' mês ' : ' meses ') : '';
            var days = diffDuration.days() > 0 ? diffDuration.days() + (diffDuration.days() === 1 ? ' dia ' : ' dias') : '';

            if (year || month || days) {
                return 'Há ' + year + month + days;
            }

            return 'Hoje';

        };
    });
})();