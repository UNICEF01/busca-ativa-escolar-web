(function () {
    angular.module('BuscaAtivaEscolar').filter('dtFormat', function () {
        return function (input) {
            //console.log('Cliente Date ' + typeof input)
            if (input) {
                return moment(input).format('DD/MM/YYYY');
            } else {
                return 'aguardando'
            }
        };
    });
})();