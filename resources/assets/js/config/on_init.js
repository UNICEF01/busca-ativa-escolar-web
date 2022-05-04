(function() {
    identify('config', 'on_init.js');

    angular
        .module('BuscaAtivaEscolar')
        .run(function(

            $rootScope,
            $state,

            Auth

        ) {
            $.material.init();

            $rootScope.$on('unauthorized', function() {
                Auth.logout();
                $state.go('login');
            });
        });
})();