(function () {
    angular.module('BuscaAtivaEscolar').filter('dateFormat', function () {
        return function (firtDate) {
            var now = new Date();
            var fDate = new Date(firtDate);

            var dateNow = moment([now.getFullYear(), now.getMonth(), now.getDate()]);
            var startDate = moment([fDate.getFullYear(), fDate.getMonth(), fDate.getDate()]);

            var diffDuration = moment.duration(dateNow.diff(startDate));
            var year = diffDuration.years() > 0 ? diffDuration.years() + 'A' : '';
            var month = diffDuration.months() > 0 ? diffDuration.months() + 'M' : '';
            var days = diffDuration.days() > 0 ? diffDuration.days() + 'D' : '';

            return 'há '+year + month + days;
        };
    });
})();