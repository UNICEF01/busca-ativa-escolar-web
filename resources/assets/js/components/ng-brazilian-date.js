(function() {
    angular.module('BuscaAtivaEscolar').filter('dtFormat', function() {
        return function(input) {
            if (input) {
                return moment(input).format('DD/MM/YYYY');
            } else {
                return 'aguardando'
            }
        };
    });
})();