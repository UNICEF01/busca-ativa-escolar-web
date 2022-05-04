(function() {
    identify('config', 'toasts.js');

    angular.module('BuscaAtivaEscolar').config(function(ngToastProvider) {
        ngToastProvider.configure({
            verticalPosition: 'top',
            horizontalPosition: 'right',
            maxNumber: 8,
            animation: 'slide',
            dismissButton: true,
            timeout: 6000
        });
    });

})();