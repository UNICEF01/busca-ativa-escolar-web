(function() {
    angular
        .module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('pdf', {
                url: '/pdf',
                templateUrl: '/views/users/pdf.html',
                controller: 'PdfCtrl',
                unauthenticated: true,
            });
        })
        .controller('PdfCtrl', function() {
            console.log('');
        });
})();